import { ILowDbClient } from "../../../../application/providers/ILowDbClient.js";
import { IDockerPort } from "../../../../application/repositories/IDockerPort.js";
import { IInstanceRepository } from "../../../../application/repositories/IInstanceRepository.js";
import { INetworkRepository } from "../../../../application/repositories/INetworkRepository.js";
import { IDetachContainerFromNetworkUseCase } from "../../../../application/usecases/networks/IDetachContainerFromNetworkUseCase.js";
import { DetachContainerFromNetworkUseCase } from "../../../../application/usecases/networks/impl/DetachContainerFromNetworkUseCase.js";
import { IController } from "../../../../presentation/http/controllers/IController.js";
import { DetachContainerFromNetworkController } from "../../../../presentation/http/controllers/networks/DetachContainerFromNetworkController.js";
import { LowDbClient } from "../../../providers/LowDbClient.js";
import { InstanceRepository } from "../../../repositories/InstanceRepository.js";
import { NetworkRepository } from "../../../repositories/NetworkRepository.js";
import { DockerPort } from "../../DockerPort.js";

export function detachContainerFromNetworkComposer(): IController {
    const client: ILowDbClient = new LowDbClient();
    const networkRepository: INetworkRepository = new NetworkRepository(client);
    const instanceRepository: IInstanceRepository = new InstanceRepository(client);
    const dockerPort: IDockerPort = new DockerPort();
    const useCase: IDetachContainerFromNetworkUseCase = new DetachContainerFromNetworkUseCase(networkRepository, instanceRepository, dockerPort);
    return new DetachContainerFromNetworkController(useCase);
}
