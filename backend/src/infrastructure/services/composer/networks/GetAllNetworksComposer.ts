import { ILowDbClient } from "../../../../application/providers/ILowDbClient.js";
import { INetworkRepository } from "../../../../application/repositories/INetworkRepository.js";
import { IGetAllNetworksUseCase } from "../../../../application/usecases/networks/IGetAllNetworksUseCase.js";
import { GetAllNetworksUseCase } from "../../../../application/usecases/networks/impl/GetAllNetworksUseCase.js";
import { IController } from "../../../../presentation/http/controllers/IController.js";
import { GetAllNetworksController } from "../../../../presentation/http/controllers/networks/GetAllNetworksController.js";
import { LowDbClient } from "../../../providers/LowDbClient.js";
import { NetworkRepository } from "../../../repositories/NetworkRepository.js";

export function getAllNetworksComposer(): IController {
    const client: ILowDbClient = new LowDbClient();
    const networkRepository: INetworkRepository = new NetworkRepository(client);
    const useCase: IGetAllNetworksUseCase = new GetAllNetworksUseCase(networkRepository);
    return new GetAllNetworksController(useCase);
}
