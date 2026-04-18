import { ILowDbClient } from "../../../application/providers/ILowDbClient.js";
import { IDockerPort } from "../../../application/repositories/IDockerPort.js";
import { IInstanceRepository } from "../../../application/repositories/IInstanceRepository.js";
import { INetworkRepository } from "../../../application/repositories/INetworkRepository.js";
import { IVolumeRepository } from "../../../application/repositories/IVolumeRepository.js";
import { ICreateInstanceUseCase } from "../../../application/usecases/instances/ICreateInstanceUseCase.js";
import { CreateInstanceUseCase } from "../../../application/usecases/instances/impl/CreateInstanceUseCase.js";
import { IController } from "../../../presentation/http/controllers/IController.js";
import { CreateInstanceController } from "../../../presentation/http/controllers/instances/CreateInstanceController.js";
import { LowDbClient } from "../../providers/LowDbClient.js";
import { InstanceRepository } from "../../repositories/InstanceRepository.js";
import { NetworkRepository } from "../../repositories/NetworkRepository.js";
import { VolumeRepository } from "../../repositories/VolumeRepository.js";
import { DockerPort } from "../DockerPort.js";


export function createInstanceComposer() : IController {
    const client : ILowDbClient = new LowDbClient();
    const instanceRepository : IInstanceRepository = new InstanceRepository(client);
    const volumeRepository : IVolumeRepository = new VolumeRepository(client);
    const networkRepository : INetworkRepository = new NetworkRepository(client);
    const dockerPort : IDockerPort = new DockerPort();
    
    const useCase : ICreateInstanceUseCase = new CreateInstanceUseCase(
        instanceRepository,
        volumeRepository, networkRepository, 
        dockerPort
    );

    const controller : IController = new CreateInstanceController(useCase);
    return controller;
}