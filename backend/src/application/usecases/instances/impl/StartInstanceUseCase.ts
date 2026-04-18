import { Instance } from "../../../../domain/models/instance.js";
import { IDockerPort } from "../../../repositories/IDockerPort.js";
import { IInstanceRepository } from "../../../repositories/IInstanceRepository.js";
import { IStartInstanceUseCase } from "../IStartInstanceUseCase.js";

export class StartInstanceUseCase implements IStartInstanceUseCase {

    constructor(
        private instanceRepository: IInstanceRepository,
        private dockerPort: IDockerPort,
    ) {}

    async execute(id: string): Promise<Instance> {
        const instance = this.instanceRepository.getById(id);
        if (!instance) {
            throw new Error(`Instance "${id}" introuvable`);
        }
        if (instance.status === 'running') {
            throw new Error(`L'instance "${id}" est déjà en cours d'exécution`);
        }

        await this.dockerPort.startInstance(instance.containerId);
        return this.instanceRepository.update(instance.id, { status: 'running' });
    }
}
