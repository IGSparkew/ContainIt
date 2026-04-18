import { Network } from "../../../../domain/models/networks.js";
import { INetworkRepository } from "../../../repositories/INetworkRepository.js";
import { IGetAllNetworksUseCase } from "../IGetAllNetworksUseCase.js";

export class GetAllNetworksUseCase implements IGetAllNetworksUseCase {

    constructor(private networkRepository: INetworkRepository) {}

    execute(): Network[] {
        return this.networkRepository.getAll();
    }
}
