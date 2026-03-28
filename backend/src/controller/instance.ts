import { inject, injectable } from "tsyringe";
import { DbService } from "../services/dbService.js";
import { ValidationService } from "../services/validationService.js";
import { DockerService } from "../services/dockerService.js";
import { Context } from "hono";
import { CreateInstanceInput } from "../schemas/Instance.js";
import { Instance } from "../models/instance.js";
import { InstanceService } from "../services/instanceService.js";
import { Volume } from "../models/volumes.js";
import { fa } from "zod/locales";
import { VolumesService } from "../services/volumesService.js";


@injectable()
export class InstanceController {
    constructor(@inject(InstanceService) private instanceService :InstanceService,
    @inject(VolumesService) private volumeService: VolumesService, 
    @inject(ValidationService) private validationService: ValidationService, 
    @inject(DockerService) private dockerService: DockerService
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
        
            // 1. Validation
            await this.validationService.checkPortRange(body.port)
            await this.validationService.checkPortAvailable(body.port)
            this.validationService.checkNameUnique(body.name)
            this.validationService.checkImageSupported(body.type)
            this.validationService.checkPasswordStrength(body.password)

            //1 bis Création de l'id de volume
            const volumeId = crypto.randomUUID();

            // 2. Création du conteneur Docker
            const createInstanceResult = await this.dockerService.createInstance(body, volumeId)
        
            // 2. Sauvegarde dans db.json
            const instance: Instance = {
              id: crypto.randomUUID(),
              name: body.name,
              type: body.type,
              image: `${body.type}:${body.version ?? 'latest'}`,
              port: body.port,
              password: body.password,
              containerId: createInstanceResult.containerId,
              status: 'stopped',
              createdAt: new Date().toISOString()
            }

            const volume: Volume = {
                id: volumeId,
                name: createInstanceResult.volumeName,
                type: body.type,
                containerId: createInstanceResult.containerId,
                createdAt: new Date().toISOString(),
                orphan: false
            };
        
            this.instanceService.save(instance);
            this.volumeService.save(volume);
        
        
            return c.json(instance, 201);
    }

    async deleteInstance(c: Context) {
         const id = c.req.param('id');
        if (!id) {
             return c.json({"message": "Error wrong id"});
        }
        const instance = this.instanceService.getById(id);
        if (!instance) {
            return c.json({"message": "Error wrong id"});
        }

        const statusContainer = await this.dockerService.getStatus(instance.containerId);

        if (statusContainer == 'running') {
            await this.dockerService.stopInstance(instance.containerId);
        }

        await this.dockerService.deleteInstance(instance.containerId);

        this.instanceService.remove(instance.id);

        return c.json({"message":"remove instance with id: " + id}, 200);
    }


}