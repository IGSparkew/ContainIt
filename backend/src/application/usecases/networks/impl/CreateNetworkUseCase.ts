import { CreateNetworkDTO } from "../../../../domain/dto/network.dot.js";
import { Network } from "../../../../domain/models/networks.js";
import { IDockerPort } from "../../../repositories/IDockerPort.js";
import { INetworkRepository } from "../../../repositories/INetworkRepository.js";
import { ICreateNetworkUseCase } from "../ICreateNetworkUseCase.js";

// Name must contain only alphanumeric characters, hyphens and underscores
const NAME_REGEX = /^[a-zA-Z0-9-_]+$/;

export class CreateNetworkUseCase implements ICreateNetworkUseCase {

    constructor(
        private networkRepository: INetworkRepository,
        private dockerPort: IDockerPort,
    ) {}

    async execute(dto: CreateNetworkDTO): Promise<Network> {
        // Validate name format
        if (!NAME_REGEX.test(dto.name) || dto.name.length < 2 || dto.name.length > 32) {
            throw new Error("Invalid name — only letters, digits, hyphens and underscores allowed (2–32 characters)");
        }

        // Ensure name is unique
        const existing = this.networkRepository.getAll().find(n => n.name === dto.name);
        if (existing) {
            throw new Error(`A network with the name "${dto.name}" already exists`);
        }

        const { dockerId } = await this.dockerPort.createNetwork(dto.name, dto.driver);

        const network: Network = {
            id: crypto.randomUUID(),
            name: dto.name,
            driver: dto.driver,
            dockerId,
            instance: [],
            createdAt: new Date().toISOString(),
        };

        return this.networkRepository.save(network);
    }
}
