import { Stats } from "../../../domain/models/stats.js";
import { IDockerPort } from "../../repositories/IDockerPort.js";
import { IInstanceRepository } from "../../repositories/IInstanceRepository.js";
import { IGetInstanceStatsUseCase } from "../IGetInstanceStatsUseCase.js";

export class GetInstanceStatsUseCase implements IGetInstanceStatsUseCase {

    constructor(
        private instanceRepository: IInstanceRepository,
        private dockerPort: IDockerPort,
    ) {}

    async execute(id: string): Promise<Stats> {
        const instance = this.instanceRepository.getById(id);
        if (!instance) {
            throw new Error(`Instance "${id}" introuvable`);
        }
        if (instance.status === 'stopped') {
            throw new Error(`Impossible de récupérer les stats — l'instance "${id}" est arrêtée`);
        }

        return this.dockerPort.getStats(instance.containerId);
    }
}
