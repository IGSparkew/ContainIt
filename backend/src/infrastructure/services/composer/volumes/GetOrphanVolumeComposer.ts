import { IVolumeRepository } from "../../../../application/repositories/IVolumeRepository.js";
import { IGetOrphanVolumesUseCase } from "../../../../application/usecases/volumes/IGetOrphanVolumesUseCase.js";
import { GetOrphanVolumesUseCase } from "../../../../application/usecases/volumes/impl/GetOrphanVolumesUseCase.js";
import { IController } from "../../../../presentation/http/controllers/IController.js";
import { GetOrphanVolumeController } from "../../../../presentation/http/controllers/volumes/GetOrphanVolumeController.js";
import { LowDbClient } from "../../../providers/LowDbClient.js";
import { VolumeRepository } from "../../../repositories/VolumeRepository.js";


export function getOrphanVolumeComposer() : IController {
    const client = new LowDbClient();
    const volumeRepository : IVolumeRepository = new VolumeRepository(client);
    const getOrphanVolumeUseCase : IGetOrphanVolumesUseCase = new GetOrphanVolumesUseCase(volumeRepository);
    const controller : IController = new GetOrphanVolumeController(getOrphanVolumeUseCase);
    return controller;
}