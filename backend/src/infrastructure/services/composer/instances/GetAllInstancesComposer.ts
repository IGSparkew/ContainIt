import { ILowDbClient } from "../../../../application/providers/ILowDbClient.js";
import { IInstanceRepository } from "../../../../application/repositories/IInstanceRepository.js";
import { IGetAllInstancesUseCase } from "../../../../application/usecases/instances/IGetAllInstancesUseCase.js";
import { GetAllInstancesUseCase } from "../../../../application/usecases/instances/impl/GetAllInstancesUseCase.js";
import { IController } from "../../../../presentation/http/controllers/IController.js";
import { GetAllInstancesController } from "../../../../presentation/http/controllers/instances/GetAllInstancesController.js";
import { LowDbClient } from "../../../providers/LowDbClient.js";
import { InstanceRepository } from "../../../repositories/InstanceRepository.js";

export function getAllInstancesComposer(): IController {
    const client: ILowDbClient = new LowDbClient();
    const instanceRepository: IInstanceRepository = new InstanceRepository(client);
    const useCase: IGetAllInstancesUseCase = new GetAllInstancesUseCase(instanceRepository);
    return new GetAllInstancesController(useCase);
}
