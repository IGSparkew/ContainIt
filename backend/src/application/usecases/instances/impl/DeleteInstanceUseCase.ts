import { isAdminType } from "../../../../domain/models/instance.js";
import { IDockerPort } from "../../../repositories/IDockerPort.js";
import { IInstanceRepository } from "../../../repositories/IInstanceRepository.js";
import { INetworkRepository } from "../../../repositories/INetworkRepository.js";
import { IVolumeRepository } from "../../../repositories/IVolumeRepository.js";
import { IDeleteInstanceUseCase } from "../IDeleteInstanceUseCase.js";

export class DeleteInstanceUseCase implements IDeleteInstanceUseCase {

    constructor(
        private instanceRepository: IInstanceRepository,
        private volumeRepository: IVolumeRepository,
        private networkRepository: INetworkRepository,
        private dockerPort: IDockerPort,
    ) {}

    async execute(id: string, keepVolume: boolean): Promise<void> {
        const instance = this.instanceRepository.getById(id);
        if (!instance) {
            throw new Error(`Instance "${id}" not found`);
        }

        if (isAdminType(instance.type)) {
            // --- Admin tool branch ---
            if (instance.networkId) {
                const network = this.networkRepository.getById(instance.networkId);
                if (network) {
                    await this.dockerPort.disconnectContainer(network.dockerId, instance.containerId);
                }
            }
            await this.dockerPort.deleteInstance(instance.containerId, true, undefined);
            this.instanceRepository.remove(instance.id);
            return;
        }

        // --- DB instance branch ---
        const volume = this.volumeRepository.getByContainerId(instance.containerId);
        const volumeName = volume !== undefined ? volume.name : undefined;

        const statusContainer = await this.dockerPort.getStatus(instance.containerId);
        if (statusContainer === 'running') {
            await this.dockerPort.stopInstance(instance.containerId);
        }

        await this.dockerPort.deleteInstance(instance.containerId, keepVolume, volumeName);
        this.instanceRepository.remove(instance.id);

        if (volume !== undefined) {
            if (keepVolume) {
                this.volumeRepository.unlinkVolume(volume.id);
            } else {
                this.volumeRepository.remove(volume.id);
            }
        }
    }
}