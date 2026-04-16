import { Instance } from "../../domain/models/instance.js";

export interface IGetInstanceByIdUseCase {
    execute(id: string): Promise<Instance | undefined>;
}