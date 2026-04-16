import { IDockerPort } from "../../../repositories/IDockerPort.js";
import { INetworkRepository } from "../../../repositories/INetworkRepository.js";
import { IDeleteNetworkUseCase } from "../IDeleteNetworkUseCase.js";

export class DeleteNetworkUseCase implements IDeleteNetworkUseCase {

    constructor(
        private networkRepository: INetworkRepository,
        private dockerPort: IDockerPort,
    ) {}

    async execute(id: string): Promise<void> {
        const network = this.networkRepository.getById(id);
        if (!network) {
            throw new Error(`Network "${id}" not found`);
        }

        // Cannot delete a network that still has containers attached
        if (network.instance.length > 0) {
            throw new Error(
                `Cannot delete network "${network.name}" — ${network.instance.length} container(s) still connected`
            );
        }

        await this.dockerPort.removeNetwork(network.dockerId);
        this.networkRepository.remove(id);
    }
}
