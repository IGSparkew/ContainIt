import { Network } from "../../../domain/models/networks.js";

export interface IAttachContainerToNetworkUseCase {
    execute(networkId: string, instanceId: string): Promise<Network>;
}
