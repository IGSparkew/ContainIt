import { ILowDbClient } from "../../../../application/providers/ILowDbClient.js";
import { IInstanceRepository } from "../../../../application/repositories/IInstanceRepository.js";
import { IGetInstanceByIdUseCase } from "../../../../application/usecases/instances/IGetInstanceByIdUseCase.js";
import { GetInstanceByIdUseCase } from "../../../../application/usecases/instances/impl/GetInstanceByIdUseCase.js";
import { IController } from "../../../../presentation/http/controllers/IController.js";
import { GetInstanceByIdController } from "../../../../presentation/http/controllers/instances/GetInstanceByIdController.js";
import { LowDbClient } from "../../../providers/LowDbClient.js";
import { InstanceRepository } from "../../../repositories/InstanceRepository.js";

export function getInstanceByIdComposer(): IController {
    const client: ILowDbClient = new LowDbClient();
    const instanceRepository: IInstanceRepository = new InstanceRepository(client);
    const useCase: IGetInstanceByIdUseCase = new GetInstanceByIdUseCase(instanceRepository);
    return new GetInstanceByIdController(useCase);
}
