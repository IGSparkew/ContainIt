import { ILowDbClient } from "../../../../application/providers/ILowDbClient.js";
import { IDockerPort } from "../../../../application/repositories/IDockerPort.js";
import { IInstanceRepository } from "../../../../application/repositories/IInstanceRepository.js";
import { IGetInstanceStatsUseCase } from "../../../../application/usecases/instances/IGetInstanceStatsUseCase.js";
import { GetInstanceStatsUseCase } from "../../../../application/usecases/instances/impl/GetInstanceStatsUseCase.js";
import { IController } from "../../../../presentation/http/controllers/IController.js";
import { GetInstanceStatsController } from "../../../../presentation/http/controllers/instances/GetInstanceStatsController.js";
import { LowDbClient } from "../../../providers/LowDbClient.js";
import { InstanceRepository } from "../../../repositories/InstanceRepository.js";
import { DockerPort } from "../../DockerPort.js";

export function getInstanceStatsComposer(): IController {
    const client: ILowDbClient = new LowDbClient();
    const instanceRepository: IInstanceRepository = new InstanceRepository(client);
    const dockerPort: IDockerPort = new DockerPort();
    const useCase: IGetInstanceStatsUseCase = new GetInstanceStatsUseCase(instanceRepository, dockerPort);
    return new GetInstanceStatsController(useCase);
}
