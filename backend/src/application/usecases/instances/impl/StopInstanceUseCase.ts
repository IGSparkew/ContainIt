import { Instance } from "../../../../domain/models/instance.js";
import { IDockerPort } from "../../../repositories/IDockerPort.js";
import { IInstanceRepository } from "../../../repositories/IInstanceRepository.js";
import { IStopInstanceUseCase } from "../IStopInstanceUseCase.js";

export class StopInstanceUseCase implements IStopInstanceUseCase {

    constructor(
        private instanceRepository: IInstanceRepository,
        private dockerPort: IDockerPort,
    ) {}

    async execute(id: string): Promise<Instance> {
        const instance = this.instanceRepository.getById(id);
        if (!instance) {
            throw new Error(`Instance "${id}" introuvable`);
        }
        if (instance.status === 'stopped') {
            throw new Error(`L'instance "${id}" est déjà arrêtée`);
        }

        await this.dockerPort.stopInstance(instance.containerId);
        return this.instanceRepository.update(instance.id, { status: 'stopped' });
    }
}
