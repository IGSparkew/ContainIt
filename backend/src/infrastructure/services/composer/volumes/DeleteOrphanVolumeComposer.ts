import { IVolumeRepository } from "../../../../application/repositories/IVolumeRepository.js";
import { IDeleteOrphanVolumeUseCase } from "../../../../application/usecases/volumes/IDeleteOrphanVolumeUseCase.js";
import { DeleteOrphanVolumeUseCase } from "../../../../application/usecases/volumes/impl/DeleteOrphanVolumeUseCase.js";
import { IController } from "../../../../presentation/http/controllers/IController.js";
import { DeleteOrphanVolumeController } from "../../../../presentation/http/controllers/volumes/DeleteOrphanVolumeController.js";
import { LowDbClient } from "../../../providers/LowDbClient.js";
import { VolumeRepository } from "../../../repositories/VolumeRepository.js";

export function deleteOrphanVolumeComposer() : IController {
    const client = new LowDbClient();
    const volumeRepository : IVolumeRepository = new VolumeRepository(client);
    const deleteOrphanVolumeUseCase : IDeleteOrphanVolumeUseCase = new DeleteOrphanVolumeUseCase(volumeRepository);
    const controller = new DeleteOrphanVolumeController(deleteOrphanVolumeUseCase);
    return controller;
}