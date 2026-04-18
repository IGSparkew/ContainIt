import { inject, injectable } from "tsyringe";
import { ValidationService } from "../services/validationService.js";
import { DockerService, ADMIN_TOOL_CONFIG } from "../services/dockerService.js";
import { Context } from "hono";
import { CreateInstanceInput } from "../presentation/hono/schemas/Instance.js";
import { AdminToolType, Instance, isAdminType } from "../models/instance.js";
import { InstanceService } from "../services/instanceService.js";
import { Volume } from "../models/volumes.js";
import { VolumesService } from "../services/volumesService.js";
import { NetworksService } from "../services/networksService.js";


@injectable()
export class InstanceController {
    constructor(
    @inject(InstanceService) private instanceService: InstanceService,
    @inject(VolumesService) private volumeService: VolumesService,
    @inject(ValidationService) private validationService: ValidationService,
    @inject(DockerService) private dockerService: DockerService,
    @inject(NetworksService) private networksService: NetworksService
    ) {}

    getInstance(c:  Context) {
        const id = c.req.param('id');
        if (!id) {
             return c.json({"message": "Error wrong id"});
        }
        const instance = this.instanceService.getById(id);
        if (!instance) {
            return c.json({"message": "Error wrong id"});
        }
        return c.json(instance, 200);
    }

    getAllInstance(c:  Context) {
        const instances = this.instanceService.getAll();
        return c.json(instances, 200);
    }

    async createInstance(c: Context) {
        const body = await c.req.json<CreateInstanceInput>();

        this.validationService.checkNameUnique(body.name);

        if (isAdminType(body.type)) {
            // --- Branche outil admin ---
            this.validationService.checkNetworkExists(body.networkId!)
            const network = this.networksService.getById(body.networkId!)!
            const port = await this.validationService.findFreePort(10000)
            const { image } = ADMIN_TOOL_CONFIG[body.type as AdminToolType]

            // Env vars spécifiques à mongo-express : pointer vers le container mongo du réseau
            let adminEnv: string[] = []
            if (body.type === 'mongo-express') {
                const mongoInstance = this.instanceService
                    .getAll()
                    .find(i => i.type === 'mongo' && network.instance.includes(i.id))
                if (!mongoInstance) {
                    return c.json({ message: 'Aucune instance MongoDB trouvée sur ce réseau' }, 422)
                }
                const mongoUrl = `mongodb://admin:${mongoInstance.password}@containit-${mongoInstance.name}:27017/?authSource=admin`
                adminEnv = [
                    `ME_CONFIG_MONGODB_URL=${mongoUrl}`,
                    `ME_CONFIG_BASICAUTH=false`,
                ]
            }

            const containerId = await this.dockerService.createAdminTool(body.type as AdminToolType, body.name, port, network.dockerId, adminEnv)
            await this.dockerService.startInstance(containerId)

            const instance: Instance = {
                id: crypto.randomUUID(),
                name: body.name,
                type: body.type,
                image,
                port,
                password: '',
                containerId,
                status: 'running',
                createdAt: new Date().toISOString(),
                networkId: body.networkId
            }
            this.instanceService.save(instance)
            return c.json(instance, 201)
        }

        // --- Branche instance DB (flux existant inchangé) ---
        this.validationService.checkPortRange(body.port!)
        await this.validationService.checkPortAvailable(body.port!)
        this.validationService.checkImageSupported(body.type)
        this.validationService.checkPasswordStrength(body.password!)

        let volumeId = crypto.randomUUID();
        let createInstanceResult;

        if (body.volumeId !== undefined) {
            let orphanVolume = this.volumeService.getById(body.volumeId);
            if (!orphanVolume) {
                return c.json("Error volume not found", 404);
            }
            createInstanceResult = await this.dockerService.createInstance(body, volumeId, true, orphanVolume?.name)
            this.volumeService.linkVolume(orphanVolume?.id, createInstanceResult.containerId);
        } else {
            createInstanceResult = await this.dockerService.createInstance(body, volumeId, false, undefined);
            const volume: Volume = {
                id: volumeId,
                name: createInstanceResult.volumeName,
                type: body.type,
                containerId: createInstanceResult.containerId,
                createdAt: new Date().toISOString(),
                orphan: false
            };
            this.volumeService.save(volume);
        }

        const instance: Instance = {
            id: crypto.randomUUID(),
            name: body.name,
            type: body.type,
            image: `${body.type}:${body.version ?? 'latest'}`,
            port: body.port!,
            password: body.password!,
            containerId: createInstanceResult.containerId,
            status: 'stopped',
            createdAt: new Date().toISOString()
        }
        this.instanceService.save(instance);
        return c.json(instance, 201);
    }

    async deleteInstance(c: Context) {
        const id = c.req.param('id');
        const keepVolume = c.req.query('keepVolume') === 'true';
        if (!id) {
            return c.json({"message": "Error wrong id"});
        }
        const instance = this.instanceService.getById(id);
        if (!instance) {
            return c.json({"message": "Error wrong id"});
        }

        if (isAdminType(instance.type)) {
            // --- Branche outil admin ---
            if (instance.networkId) {
                const network = this.networksService.getById(instance.networkId)
                if (network) {
                    await this.dockerService.disconnectContainer(network.dockerId, instance.containerId)
                }
            }
            await this.dockerService.deleteInstance(instance.containerId, true, undefined)
            this.instanceService.remove(instance.id)
            return c.json({"message": "remove instance with id: " + id}, 200);
        }

        // --- Branche instance DB (flux existant inchangé) ---
        const volume = this.volumeService.getByContainerId(instance.containerId);
        const volumeName = volume !== undefined ? volume.name : undefined;

        const statusContainer = await this.dockerService.getStatus(instance.containerId);
        if (statusContainer == 'running') {
            await this.dockerService.stopInstance(instance.containerId);
        }

        await this.dockerService.deleteInstance(instance.containerId, keepVolume, volumeName);
        this.instanceService.remove(instance.id);

        if (volume !== undefined) {
            if (keepVolume) {
                this.volumeService.unlinkVolume(volume.id);
            } else {
                this.volumeService.remove(volume.id);
            }
        }

        return c.json({"message":"remove instance with id: " + id}, 200);
    }


}