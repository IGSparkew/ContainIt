import { Instance } from "../../domain/models/instance.js";

export interface IStartInstanceUseCase {
    execute(id: string): Promise<Instance>;
}
