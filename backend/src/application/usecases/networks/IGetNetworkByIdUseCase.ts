import { Network } from "../../../domain/models/networks.js";

export interface IGetNetworkByIdUseCase {
    execute(id: string): Network;
}
