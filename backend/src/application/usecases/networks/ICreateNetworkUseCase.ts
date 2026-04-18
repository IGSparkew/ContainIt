import { CreateNetworkDTO } from "../../../domain/dto/network.dot.js";
import { Network } from "../../../domain/models/networks.js";

export interface ICreateNetworkUseCase {
    execute(dto: CreateNetworkDTO): Promise<Network>;
}
