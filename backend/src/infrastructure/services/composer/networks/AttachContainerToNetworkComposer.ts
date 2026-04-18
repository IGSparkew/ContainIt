import { ILowDbClient } from "../../../../application/providers/ILowDbClient.js";
import { IDockerPort } from "../../../../application/repositories/IDockerPort.js";
import { IInstanceRepository } from "../../../../application/repositories/IInstanceRepository.js";
import { INetworkRepository } from "../../../../application/repositories/INetworkRepository.js";
import { IAttachContainerToNetworkUseCase } from "../../../../application/usecases/networks/IAttachContainerToNetworkUseCase.js";
import { AttachContainerToNetworkUseCase } from "../../../../application/usecases/networks/impl/AttachContainerToNetworkUseCase.js";
import { IController } from "../../../../presentation/http/controllers/IController.js";
import { AttachContainerToNetworkController } from "../../../../presentation/http/controllers/networks/AttachContainerToNetworkController.js";
import { LowDbClient } from "../../../providers/LowDbClient.js";
import { InstanceRepository } from "../../../repositories/InstanceRepository.js";
import { NetworkRepository } from "../../../repositories/NetworkRepository.js";
import { DockerPort } from "../../DockerPort.js";

export function attachContainerToNetworkComposer(): IController {
    const client: ILowDbClient = new LowDbClient();
    const networkRepository: INetworkRepository = new NetworkRepository(client);
    const instanceRepository: IInstanceRepository = new InstanceRepository(client);
    const dockerPort: IDockerPort = new DockerPort();
    const useCase: IAttachContainerToNetworkUseCase = new AttachContainerToNetworkUseCase(networkRepository, instanceRepository, dockerPort);
    return new AttachContainerToNetworkController(useCase);
}
