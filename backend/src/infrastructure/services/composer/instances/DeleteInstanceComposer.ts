import { ILowDbClient } from "../../../../application/providers/ILowDbClient.js";
import { IDockerPort } from "../../../../application/repositories/IDockerPort.js";
import { IInstanceRepository } from "../../../../application/repositories/IInstanceRepository.js";
import { INetworkRepository } from "../../../../application/repositories/INetworkRepository.js";
import { IVolumeRepository } from "../../../../application/repositories/IVolumeRepository.js";
import { IDeleteInstanceUseCase } from "../../../../application/usecases/instances/IDeleteInstanceUseCase.js";
import { DeleteInstanceUseCase } from "../../../../application/usecases/instances/impl/DeleteInstanceUseCase.js";
import { IController } from "../../../../presentation/http/controllers/IController.js";
import { DeleteInstanceController } from "../../../../presentation/http/controllers/instances/DeleteInstanceController.js";
import { LowDbClient } from "../../../providers/LowDbClient.js";
import { InstanceRepository } from "../../../repositories/InstanceRepository.js";
import { NetworkRepository } from "../../../repositories/NetworkRepository.js";
import { VolumeRepository } from "../../../repositories/VolumeRepository.js";
import { DockerPort } from "../../DockerPort.js";

export function deleteInstanceComposer(): IController {
    const client: ILowDbClient = new LowDbClient();
    const instanceRepository: IInstanceRepository = new InstanceRepository(client);
    const volumeRepository: IVolumeRepository = new VolumeRepository(client);
    const networkRepository: INetworkRepository = new NetworkRepository(client);
    const dockerPort: IDockerPort = new DockerPort();
    const useCase: IDeleteInstanceUseCase = new DeleteInstanceUseCase(instanceRepository, volumeRepository, networkRepository, dockerPort);
    return new DeleteInstanceController(useCase);
}
