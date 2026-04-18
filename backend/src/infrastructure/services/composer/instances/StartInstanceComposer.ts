import { ILowDbClient } from "../../../../application/providers/ILowDbClient.js";
import { IDockerPort } from "../../../../application/repositories/IDockerPort.js";
import { IInstanceRepository } from "../../../../application/repositories/IInstanceRepository.js";
import { IStartInstanceUseCase } from "../../../../application/usecases/instances/IStartInstanceUseCase.js";
import { StartInstanceUseCase } from "../../../../application/usecases/instances/impl/StartInstanceUseCase.js";
import { IController } from "../../../../presentation/http/controllers/IController.js";
import { StartInstanceController } from "../../../../presentation/http/controllers/instances/StartInstanceController.js";
import { LowDbClient } from "../../../providers/LowDbClient.js";
import { InstanceRepository } from "../../../repositories/InstanceRepository.js";
import { DockerPort } from "../../DockerPort.js";

export function startInstanceComposer(): IController {
    const client: ILowDbClient = new LowDbClient();
    const instanceRepository: IInstanceRepository = new InstanceRepository(client);
    const dockerPort: IDockerPort = new DockerPort();
    const useCase: IStartInstanceUseCase = new StartInstanceUseCase(instanceRepository, dockerPort);
    return new StartInstanceController(useCase);
}
