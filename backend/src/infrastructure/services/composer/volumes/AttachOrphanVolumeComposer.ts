import { IInstanceRepository } from "../../../../application/repositories/IInstanceRepository.js";
import { IVolumeRepository } from "../../../../application/repositories/IVolumeRepository.js";
import { AttachVolumeUseCase } from "../../../../application/usecases/volumes/impl/AttachVolumeUseCase.js";
import { IController } from "../../../../presentation/http/controllers/IController.js";
import { AttachOrphanVolumeController } from "../../../../presentation/http/controllers/volumes/AttachOrphanVolumeController.js";
import { LowDbClient } from "../../../providers/LowDbClient.js";
import { InstanceRepository } from "../../../repositories/InstanceRepository.js";
import { VolumeRepository } from "../../../repositories/VolumeRepository.js";


export function attachOrphanVolumeComposer() : IController {
    const client = new LowDbClient();
    const volumeRepository : IVolumeRepository = new VolumeRepository(client);
    const instanceRepository : IInstanceRepository = new InstanceRepository(client);
    const attachOrphanVolumeUseCase = new AttachVolumeUseCase(volumeRepository, instanceRepository);

    const controller : IController = new AttachOrphanVolumeController(attachOrphanVolumeUseCase);
    return controller;
}