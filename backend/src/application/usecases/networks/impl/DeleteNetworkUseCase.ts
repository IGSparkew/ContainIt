import { IDockerPort } from "../../../repositories/IDockerPort.js";
import { IInstanceRepository } from "../../../repositories/IInstanceRepository.js";
import { INetworkRepository } from "../../../repositories/INetworkRepository.js";
import { IDeleteNetworkUseCase } from "../IDeleteNetworkUseCase.js";

export class DeleteNetworkUseCase implements IDeleteNetworkUseCase {

    constructor(
        private networkRepository: INetworkRepository,
        private instanceRepository: IInstanceRepository,
        private dockerPort: IDockerPort,
    ) {}

    async execute(id: string): Promise<void> {
        const network = this.networkRepository.getById(id);
        if (!network) {
            throw new Error(`Network "${id}" not found`);
        }

        const activeInstances = network.instance.filter(
            containerId => this.instanceRepository.getAll().some(i => i.containerId === containerId)
        );

        if (activeInstances.length > 0) {
            throw new Error(
                `Cannot delete network "${network.name}" — ${activeInstances.length} container(s) still connected`
            );
        }

        if (network.instance.length !== activeInstances.length) {
            this.networkRepository.update(id, { instance: activeInstances });
        }

        await this.dockerPort.removeNetwork(network.dockerId);
        this.networkRepository.remove(id);
    }
}
