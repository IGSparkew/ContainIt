import { Network } from "../../../../domain/models/networks.js";
import { INetworkRepository } from "../../../repositories/INetworkRepository.js";
import { IGetNetworkByIdUseCase } from "../IGetNetworkByIdUseCase.js";

export class GetNetworkByIdUseCase implements IGetNetworkByIdUseCase {

    constructor(private networkRepository: INetworkRepository) {}

    execute(id: string): Network {
        const network = this.networkRepository.getById(id);
        if (!network) {
            throw new Error(`Network "${id}" not found`);
        }
        return network;
    }
}
