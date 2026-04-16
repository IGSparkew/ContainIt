import { Instance } from "../../domain/models/instance.js";

export interface IGetAllInstancesUseCase {
    execute(): Promise<Instance[]>;
}