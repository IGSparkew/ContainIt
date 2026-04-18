import { Network } from "../../../../domain/models/networks.js";
import { IDockerPort } from "../../../repositories/IDockerPort.js";
import { IInstanceRepository } from "../../../repositories/IInstanceRepository.js";
import { INetworkRepository } from "../../../repositories/INetworkRepository.js";
import { IAttachContainerToNetworkUseCase } from "../IAttachContainerToNetworkUseCase.js";

export class AttachContainerToNetworkUseCase implements IAttachContainerToNetworkUseCase {

    constructor(
        private networkRepository: INetworkRepository,
        private instanceRepository: IInstanceRepository,
        private dockerPort: IDockerPort,
    ) {}

    async execute(networkId: string, instanceId: string): Promise<Network> {
        const network = this.networkRepository.getById(networkId);
        if (!network) {
            throw new Error(`Network "${networkId}" not found`);
        }

        const instance = this.instanceRepository.getById(instanceId);
        if (!instance) {
            throw new Error(`Instance "${instanceId}" not found`);
        }

        // Check if the instance is already attached to this network
        if (network.instance.includes(instanceId)) {
            throw new Error(`Instance "${instanceId}" is already attached to network "${network.name}"`);
        }

        await this.dockerPort.connectContainer(network.dockerId, instance.containerId);

        return this.networkRepository.attachContainer(networkId, instanceId);
    }
}
