import { CreateInstanceDTO } from "../../domain/dto/instance.dto.js";
import { Instance } from "../../domain/models/instance.js";

export interface ICreateInstanceUseCase {
    execute(dto: CreateInstanceDTO): Promise<Instance>;
}
