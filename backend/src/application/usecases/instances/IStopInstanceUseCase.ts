import { Instance } from "../../../domain/models/instance.js";

export interface IStopInstanceUseCase {
    execute(id: string): Promise<Instance>;
}
