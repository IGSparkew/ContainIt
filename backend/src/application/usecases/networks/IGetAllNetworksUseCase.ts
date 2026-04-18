import { Network } from "../../../domain/models/networks.js";

export interface IGetAllNetworksUseCase {
    execute(): Network[];
}
