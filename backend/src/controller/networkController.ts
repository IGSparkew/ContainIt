import { inject, injectable } from "tsyringe";
import { Context } from "hono";
import { NetworksService } from "../services/networksService.js";
import { DockerService } from "../services/dockerService.js";
import { ValidationService } from "../services/validationService.js";
import { AttachContainerInput, CreateNetworkInput } from "../schemas/network.js";
import { Network } from "../models/networks.js";


@injectable()
export class NetworkController {

    constructor(
        @inject(NetworksService) private networksService: NetworksService,
        @inject(DockerService) private dockerService: DockerService,
        @inject(ValidationService) private validationService: ValidationService
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
        this.validationService.checkInstanceExists(body.containerId);

        const network = this.networksService.getById(id)!;
        await this.dockerService.connectContainer(network.dockerId, body.containerId);

        return c.json(this.networksService.attachContainer(id, body.containerId), 200);
    }

    async detachContainer(c: Context) {
        const id = c.req.param('id');
        const containerId = c.req.param('containerId');
        
        if (!id) {
            throw new Error(`Réseau introuvable`);
        }

        if (!containerId) {
            throw new Error(`Instance introuvable`);
        }

        this.validationService.checkNetworkExists(id);

        const network = this.networksService.getById(id)!;
        await this.dockerService.disconnectContainer(network.dockerId, containerId);

        return c.json(this.networksService.detachContainer(id, containerId), 200);
    }
}
