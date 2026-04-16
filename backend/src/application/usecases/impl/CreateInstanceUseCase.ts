import { CreateInstanceDTO } from "../../../domain/dto/instance.dto.js";
import { AdminToolType, Instance, isAdminType } from "../../../domain/models/instance.js";
import { Volume } from "../../../domain/models/volumes.js";
import { IDockerPort } from "../../repositories/IDockerPort.js";
import { IInstanceRepository } from "../../repositories/IInstanceRepository.js";
import { INetworkRepository } from "../../repositories/INetworkRepository.js";
import { IVolumeRepository } from "../../repositories/IVolumeRepository.js";
import { ICreateInstanceUseCase } from "../ICreateInstanceUseCase.js";

const SUPPORTED_DB_IMAGES = ['postgres', 'mysql', 'mongo', 'redis'] as const;

const ADMIN_TOOL_IMAGES: Record<AdminToolType, string> = {
    'adminer':       'adminer',
    'mongo-express': 'mongo-express',
    'redisinsight':  'redis/redisinsight',
};

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
            throw new Error(`Une instance avec le nom "${dto.name}" existe déjà`);
        }

        if (isAdminType(dto.type)) {
            return this.createAdminTool(dto);
        }

        return this.createDbInstance(dto);
    }

    private async createAdminTool(dto: CreateInstanceDTO): Promise<Instance> {
        if (!dto.networkId) {
            throw new Error('Un réseau est requis pour créer un outil admin');
        }

        const network = this.networkRepository.getById(dto.networkId);
        if (!network) {
            throw new Error(`Réseau "${dto.networkId}" introuvable`);
        }

        const port = await this.dockerPort.findFreePort(10000);

        let adminEnv: string[] = [];
        if (dto.type === 'mongo-express') {
            const mongoInstance = this.instanceRepository
                .getAll()
                .find(i => i.type === 'mongo' && network.instance.includes(i.id));
            if (!mongoInstance) {
                throw new Error('Aucune instance MongoDB trouvée sur ce réseau');
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
            throw new Error('Un port est requis pour créer une instance base de données');
        }
        if (!dto.password) {
            throw new Error('Un mot de passe est requis pour créer une instance base de données');
        }
        if (dto.port < 1024 || dto.port > 65535) {
            throw new Error(`Port ${dto.port} invalide — doit être entre 1024 et 65535`);
        }
        if (!SUPPORTED_DB_IMAGES.includes(dto.type as typeof SUPPORTED_DB_IMAGES[number])) {
            throw new Error(`Type "${dto.type}" non supporté — valeurs acceptées : ${SUPPORTED_DB_IMAGES.join(', ')}`);
        }
        if (dto.password.length < 6) {
            throw new Error('Mot de passe trop court — 6 caractères minimum');
        }

        await this.dockerPort.checkPortAvailable(dto.port);

        const volumeId = crypto.randomUUID();
        let createInstanceResult;

        if (dto.volumeId !== undefined) {
            const orphanVolume = this.volumeRepository.getById(dto.volumeId);
            if (!orphanVolume) {
                throw new Error(`Volume "${dto.volumeId}" introuvable`);
            }
            if (!orphanVolume.orphan) {
                throw new Error(`Le volume "${dto.volumeId}" est déjà lié à une autre instance`);
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
