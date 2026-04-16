import { Network } from "../../../domain/models/networks.js";

export interface IDetachContainerFromNetworkUseCase {
    execute(networkId: string, instanceId: string): Promise<Network>;
}
