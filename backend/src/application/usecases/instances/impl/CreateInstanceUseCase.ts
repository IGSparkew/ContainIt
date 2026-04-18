import { CreateInstanceDTO } from "../../../../domain/dto/instance.dto.js";
import { ADMIN_TOOL_IMAGES, AdminToolType, Instance, isAdminType, SUPPORTED_DB_IMAGES } from "../../../../domain/models/instance.js";
import { Volume } from "../../../../domain/models/volumes.js";
import { IDockerPort } from "../../../repositories/IDockerPort.js";
import { IInstanceRepository } from "../../../repositories/IInstanceRepository.js";
import { INetworkRepository } from "../../../repositories/INetworkRepository.js";
import { IVolumeRepository } from "../../../repositories/IVolumeRepository.js";
import { ICreateInstanceUseCase } from "../ICreateInstanceUseCase.js";

export class CreateInstanceUseCase implements ICreateInstanceUseCase {

    constructor(
        private instanceRepository: IInstanceRepository,
        private volumeRepository: IVolumeRepository,
        private networkRepository: INetworkRepository,
        private dockerPort: IDockerPort,
    ) {}

    async execute(dto: CreateInstanceDTO): Promise<Instance> {
        const existing = this.instanceRepository.getAll().find(i => i.name === dto.name);
        if (existing) {
            throw new Error(`An instance named "${dto.name}" already exists`);
        }

        if (isAdminType(dto.type)) {
            return this.createAdminTool(dto);
        }

        return this.createDbInstance(dto);
    }

    private async createAdminTool(dto: CreateInstanceDTO): Promise<Instance> {
        if (!dto.networkId) {
            throw new Error('A network is required to create an admin tool');
        }

        const network = this.networkRepository.getById(dto.networkId);
        if (!network) {
            throw new Error(`Network "${dto.networkId}" not found`);
        }

        const port = await this.dockerPort.findFreePort(10000);

        let adminEnv: string[] = [];
        if (dto.type === 'mongo-express') {
            const mongoInstance = this.instanceRepository
                .getAll()
                .find(i => i.type === 'mongo' && network.instance.includes(i.id));
            if (!mongoInstance) {
                throw new Error('No MongoDB instance found on this network');
            }
            const mongoUrl = `mongodb://admin:${mongoInstance.password}@containit-${mongoInstance.name}:27017/?authSource=admin`;
            adminEnv = [
                `ME_CONFIG_MONGODB_URL=${mongoUrl}`,
                `ME_CONFIG_BASICAUTH=false`,
            ];
        }

        const containerId = await this.dockerPort.createAdminTool(
            dto.type as AdminToolType,
            dto.name,
            port,
            network.dockerId,
            adminEnv,
        );
        await this.dockerPort.startInstance(containerId);

        const instance: Instance = {
            id: crypto.randomUUID(),
            name: dto.name,
            type: dto.type,
            image: ADMIN_TOOL_IMAGES[dto.type as AdminToolType],
            port,
            password: '',
            containerId,
            status: 'running',
            createdAt: new Date().toISOString(),
            networkId: dto.networkId,
        };

        return this.instanceRepository.save(instance);
    }

    private async createDbInstance(dto: CreateInstanceDTO): Promise<Instance> {
        if (dto.port === undefined) {
            throw new Error('A port is required to create a database instance');
        }
        if (!dto.password) {
            throw new Error('A password is required to create a database instance');
        }
        if (dto.port < 1024 || dto.port > 65535) {
            throw new Error(`Port ${dto.port} invalid — must be between 1024 and 65535`);
        }
        if (!SUPPORTED_DB_IMAGES.includes(dto.type as typeof SUPPORTED_DB_IMAGES[number])) {
            throw new Error(`Type "${dto.type}" not supported — accepted values: ${SUPPORTED_DB_IMAGES.join(', ')}`);
        }
        if (dto.password.length < 6) {
            throw new Error('Password too short — 6 characters minimum');
        }

        await this.dockerPort.checkPortAvailable(dto.port);

        const volumeId = crypto.randomUUID();
        let createInstanceResult;

        if (dto.volumeId !== undefined) {
            const orphanVolume = this.volumeRepository.getById(dto.volumeId);
            if (!orphanVolume) {
                throw new Error(`Volume "${dto.volumeId}" not found`);
            }
            if (!orphanVolume.orphan) {
                throw new Error(`Volume "${dto.volumeId}" is already linked to another instance`);
            }
            createInstanceResult = await this.dockerPort.createInstance(dto, volumeId, true, orphanVolume.name);
            this.volumeRepository.linkVolume(orphanVolume.id, createInstanceResult.containerId);
        } else {
            createInstanceResult = await this.dockerPort.createInstance(dto, volumeId, false, undefined);
            const volume: Volume = {
                id: volumeId,
                name: createInstanceResult.volumeName,
                type: dto.type,
                containerId: createInstanceResult.containerId,
                createdAt: new Date().toISOString(),
                orphan: false,
            };
            this.volumeRepository.save(volume);
        }

        const instance: Instance = {
            id: crypto.randomUUID(),
            name: dto.name,
            type: dto.type,
            image: `${dto.type}:${dto.version ?? 'latest'}`,
            port: dto.port,
            password: dto.password,
            containerId: createInstanceResult.containerId,
            status: 'stopped',
            createdAt: new Date().toISOString(),
        };

        return this.instanceRepository.save(instance);
    }
}
