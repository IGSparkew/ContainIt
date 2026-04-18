import { ILowDbClient } from "../../../../application/providers/ILowDbClient.js";
import { INetworkRepository } from "../../../../application/repositories/INetworkRepository.js";
import { IGetNetworkByIdUseCase } from "../../../../application/usecases/networks/IGetNetworkByIdUseCase.js";
import { GetNetworkByIdUseCase } from "../../../../application/usecases/networks/impl/GetNetworkByIdUseCase.js";
import { IController } from "../../../../presentation/http/controllers/IController.js";
import { GetNetworkByIdController } from "../../../../presentation/http/controllers/networks/GetNetworkByIdController.js";
import { LowDbClient } from "../../../providers/LowDbClient.js";
import { NetworkRepository } from "../../../repositories/NetworkRepository.js";

export function getNetworkByIdComposer(): IController {
    const client: ILowDbClient = new LowDbClient();
    const networkRepository: INetworkRepository = new NetworkRepository(client);
    const useCase: IGetNetworkByIdUseCase = new GetNetworkByIdUseCase(networkRepository);
    return new GetNetworkByIdController(useCase);
}
