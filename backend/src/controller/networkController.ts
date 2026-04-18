import { inject, injectable } from "tsyringe";
import { Context } from "hono";
import { NetworksService } from "../services/networksService.js";
import { DockerService } from "../services/dockerService.js";
import { ValidationService } from "../services/validationService.js";
import { InstanceService } from "../services/instanceService.js";
import { AttachContainerInput, CreateNetworkInput } from "../presentation/hono/schemas/network.js";
import { Network } from "../models/networks.js";


@injectable()
export class NetworkController {

    constructor(
        @inject(NetworksService) private networksService: NetworksService,
        @inject(DockerService) private dockerService: DockerService,
        @inject(ValidationService) private validationService: ValidationService,
        @inject(InstanceService) private instanceService: InstanceService
    ) {}

    getAllNetworks(c: Context) {
        return c.json(this.networksService.getAll(), 200);
    }

    getNetwork(c: Context) {
        const id = c.req.param('id');
        if (!id) {
            throw new Error(`Réseau introuvable`);
        }

        this.validationService.checkNetworkExists(id);
        return c.json(this.networksService.getById(id), 200);
    }

    async createNetwork(c: Context) {
        const body = await c.req.json<CreateNetworkInput>();

        this.validationService.checkNameFormat(body.name);
        this.validationService.checkNetworkNameUnique(body.name);

        const { dockerId } = await this.dockerService.createNetwork(body.name, body.driver);

        const network: Network = {
            id: crypto.randomUUID(),
            name: body.name,
            driver: body.driver,
            dockerId,
            instance: [],
            createdAt: new Date().toISOString()
        };

        return c.json(this.networksService.save(network), 201);
    }

    async deleteNetwork(c: Context) {
        const id = c.req.param('id');

        if (!id) {
            throw new Error(`Réseau introuvable`);
        }

        this.validationService.checkNetworkExists(id);
        this.validationService.checkNetworkEmpty(id);

        const network = this.networksService.getById(id)!;
        await this.dockerService.removeNetwork(network.dockerId);
        this.networksService.remove(id);

        return c.json({ message: `Réseau "${network.name}" supprimé` }, 200);
    }

    async attachContainer(c: Context) {
        const id = c.req.param('id');
        const body = await c.req.json<AttachContainerInput>();

        if (!id) {
            throw new Error(`Réseau introuvable`);
        }

        this.validationService.checkNetworkExists(id);
        this.validationService.checkInstanceExists(body.instanceId);

        const network = this.networksService.getById(id)!;
        const instance = this.instanceService.getById(body.instanceId)!;
        await this.dockerService.connectContainer(network.dockerId, instance.containerId);

        return c.json(this.networksService.attachContainer(id, body.instanceId), 200);
    }

    async detachContainer(c: Context) {
        const id = c.req.param('id');
        const instanceId = c.req.param('instanceId');

        if (!id) {
            throw new Error(`Réseau introuvable`);
        }

        if (!instanceId) {
            throw new Error(`Instance introuvable`);
        }

        this.validationService.checkNetworkExists(id);
        this.validationService.checkInstanceExists(instanceId);

        const network = this.networksService.getById(id)!;
        const instance = this.instanceService.getById(instanceId)!;
        await this.dockerService.disconnectContainer(network.dockerId, instance.containerId);

        return c.json(this.networksService.detachContainer(id, instanceId), 200);
    }
}
