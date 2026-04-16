import { AttachContainerDTO } from "../../../../domain/dto/network.dot.js";
import { Volume } from "../../../../domain/models/volumes.js";
import { IDockerPort } from "../../../repositories/IDockerPort.js";
import { IInstanceRepository } from "../../../repositories/IInstanceRepository.js";
import { IVolumeRepository } from "../../../repositories/IVolumeRepository.js";
import { IAttachVolumeUseCase } from "../IAttachVolumeUseCase.js";

export class AttachVolumeUseCase implements IAttachVolumeUseCase {

    constructor(private volumeRepository: IVolumeRepository, private instanceRepository: IInstanceRepository) {}

    execute(id: string, dto: AttachContainerDTO): Volume {
  
        if (!id || id.length == 0) {
            throw new Error(`volume not found`);
        }
        if (!dto || !dto.instanceId || dto.instanceId.length == 0) {
            throw new Error(`instance not found`);
        }

        const volume = this.volumeRepository.getById(id);
        const instance = this.instanceRepository.getById(dto.instanceId);

        if (volume === undefined) {
            throw new Error(`volume ${id} not found`);
        }
        if (instance == undefined) {
            throw new Error(`instance not found`);
        }
        if (!volume.orphan) {
            throw new Error(`volume ${id} is linked with container`)
        }
        
        return this.volumeRepository.linkVolume(id, instance.containerId);
    }
    
}