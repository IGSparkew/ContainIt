import { CreateInstanceDTO } from "../../domain/dto/instance.dto.js";
import { Instance } from "../../domain/models/instance.js";

export interface IGetAllUseCase {
    execute(): Promise<Instance[]>;
}