import { IVolumeRepository } from "../../../repositories/IVolumeRepository.js";
import { IDeleteOrphanVolumeUseCase } from "../IDeleteOrphanVolumeUseCase.js";

export class DeleteOrphanVolumeUseCase implements IDeleteOrphanVolumeUseCase {
    
    constructor(private volumeRepository: IVolumeRepository) {}
    
    execute(id: string): void {
        if (!id || id.length === 0) {
            throw new Error("volume not found");
        }
        
        const volume = this.volumeRepository.getById(id);

        if (volume === undefined) {
            throw new Error(`volume ${id} not found`);
        }

        if (!volume.orphan) {
            throw new Error(`volume ${id} is linked with container`)
        }

        this.volumeRepository.remove(id);
    }
    
}