import { ILowDbClient } from "../../../../application/providers/ILowDbClient.js";
import { IDockerPort } from "../../../../application/repositories/IDockerPort.js";
import { INetworkRepository } from "../../../../application/repositories/INetworkRepository.js";
import { ICreateNetworkUseCase } from "../../../../application/usecases/networks/ICreateNetworkUseCase.js";
import { CreateNetworkUseCase } from "../../../../application/usecases/networks/impl/CreateNetworkUseCase.js";
import { IController } from "../../../../presentation/http/controllers/IController.js";
import { CreateNetworkController } from "../../../../presentation/http/controllers/networks/CreateNetworkController.js";
import { LowDbClient } from "../../../providers/LowDbClient.js";
import { NetworkRepository } from "../../../repositories/NetworkRepository.js";
import { DockerPort } from "../../DockerPort.js";

export function createNetworkComposer(): IController {
    const client: ILowDbClient = new LowDbClient();
    const networkRepository: INetworkRepository = new NetworkRepository(client);
    const dockerPort: IDockerPort = new DockerPort();
    const useCase: ICreateNetworkUseCase = new CreateNetworkUseCase(networkRepository, dockerPort);
    return new CreateNetworkController(useCase);
}
