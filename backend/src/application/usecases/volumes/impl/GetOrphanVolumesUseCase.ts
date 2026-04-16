import { Volume } from "../../../../domain/models/volumes.js";
import { IVolumeRepository } from "../../../repositories/IVolumeRepository.js";
import { IGetOrphanVolumesUseCase } from "../IGetOrphanVolumesUseCase.js";

export class GetOrphanVolumesUseCase implements IGetOrphanVolumesUseCase {
    constructor(private volumeRepository: IVolumeRepository) {}
    execute(): Volume[] {
        const volumes = this.volumeRepository.getAll();
        return volumes.filter(v => v.orphan == true);
    }
    
}