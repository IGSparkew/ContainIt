import { Instance } from "../../../../domain/models/instance.js";
import { IInstanceRepository } from "../../../repositories/IInstanceRepository.js";
import { IGetInstanceByIdUseCase } from "../IGetInstanceByIdUseCase.js";

export class GetInstanceByIdUseCase implements IGetInstanceByIdUseCase {
    constructor(private instanceRepository: IInstanceRepository) {}
    async execute(id: string): Promise<Instance | undefined> {
        return await this.instanceRepository.getById(id);
    }
    
}