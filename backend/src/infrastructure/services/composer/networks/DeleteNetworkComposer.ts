import { ILowDbClient } from "../../../../application/providers/ILowDbClient.js";
import { IDockerPort } from "../../../../application/repositories/IDockerPort.js";
import { IInstanceRepository } from "../../../../application/repositories/IInstanceRepository.js";
import { INetworkRepository } from "../../../../application/repositories/INetworkRepository.js";
import { IDeleteNetworkUseCase } from "../../../../application/usecases/networks/IDeleteNetworkUseCase.js";
import { DeleteNetworkUseCase } from "../../../../application/usecases/networks/impl/DeleteNetworkUseCase.js";
import { IController } from "../../../../presentation/http/controllers/IController.js";
import { DeleteNetworkController } from "../../../../presentation/http/controllers/networks/DeleteNetworkController.js";
import { LowDbClient } from "../../../providers/LowDbClient.js";
import { InstanceRepository } from "../../../repositories/InstanceRepository.js";
import { NetworkRepository } from "../../../repositories/NetworkRepository.js";
import { DockerPort } from "../../DockerPort.js";

export function deleteNetworkComposer(): IController {
    const client: ILowDbClient = new LowDbClient();
    const networkRepository: INetworkRepository = new NetworkRepository(client);
    const instanceRepository: IInstanceRepository = new InstanceRepository(client);
    const dockerPort: IDockerPort = new DockerPort();
    const useCase: IDeleteNetworkUseCase = new DeleteNetworkUseCase(networkRepository, instanceRepository, dockerPort);
    return new DeleteNetworkController(useCase);
}
