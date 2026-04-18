import { ILowDbClient } from "../../../../application/providers/ILowDbClient.js";
import { IDockerPort } from "../../../../application/repositories/IDockerPort.js";
import { IInstanceRepository } from "../../../../application/repositories/IInstanceRepository.js";
import { IStopInstanceUseCase } from "../../../../application/usecases/instances/IStopInstanceUseCase.js";
import { StopInstanceUseCase } from "../../../../application/usecases/instances/impl/StopInstanceUseCase.js";
import { IController } from "../../../../presentation/http/controllers/IController.js";
import { StopInstanceController } from "../../../../presentation/http/controllers/instances/StopInstanceController.js";
import { LowDbClient } from "../../../providers/LowDbClient.js";
import { InstanceRepository } from "../../../repositories/InstanceRepository.js";
import { DockerPort } from "../../DockerPort.js";

export function stopInstanceComposer(): IController {
    const client: ILowDbClient = new LowDbClient();
    const instanceRepository: IInstanceRepository = new InstanceRepository(client);
    const dockerPort: IDockerPort = new DockerPort();
    const useCase: IStopInstanceUseCase = new StopInstanceUseCase(instanceRepository, dockerPort);
    return new StopInstanceController(useCase);
}
