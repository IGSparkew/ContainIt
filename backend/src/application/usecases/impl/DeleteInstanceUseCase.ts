import { IDockerPort } from "../../repositories/IDockerPort.js";
import { IInstanceRepository } from "../../repositories/IInstanceRepository.js";
import { INetworkRepository } from "../../repositories/INetworkRepository.js";
import { IVolumeRepository } from "../../repositories/IVolumeRepository.js";
import { IDeleteInstanceUseCase } from "../IDeleteInstanceUseCase.js";

export class DeleteInstanceUseCase implements IDeleteInstanceUseCase {

    constructor(private instanceRepository: IInstanceRepository, private volumeRepository: IVolumeRepository, private networkRepository: INetworkRepository, private dockerPort: IDockerPort) {}

    async execute(id: string, keepVolume: boolean): Promise<void> {
        const instance = this.instanceRepository.getById(id);
        if (!instance) {
            throw new Error("Error wrong id");
        }

        // if (isAdminType(instance.type)) {
        //     // --- Branche outil admin ---
        //     if (instance.networkId) {
        //         const network = this.networksService.getById(instance.networkId)
        //         if (network) {
        //             await this.dockerService.disconnectContainer(network.dockerId, instance.containerId)
        //         }
        //     }
        //     await this.dockerService.deleteInstance(instance.containerId, true, undefined)
        //     this.instanceService.remove(instance.id)
        //     return c.json({"message": "remove instance with id: " + id}, 200);
        // }

        // --- Branche instance DB (flux existant inchangé) ---
        const volume = this.volumeRepository.getByContainerId(instance.containerId);
        const volumeName = volume !== undefined ? volume.name : undefined;

        const statusContainer = await this.dockerPort.getStatus(instance.containerId);
        if (statusContainer == 'running') {
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