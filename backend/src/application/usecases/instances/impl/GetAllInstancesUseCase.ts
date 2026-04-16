import { Instance } from "../../../../domain/models/instance.js";
import { IInstanceRepository } from "../../../repositories/IInstanceRepository.js";
import { IGetAllInstancesUseCase } from "../IGetAllInstancesUseCase.js";


export class GetAllInstancesUseCase implements IGetAllInstancesUseCase {
    constructor(private instanceRepository: IInstanceRepository) {}
    async execute(): Promise<Instance[]> {
        return await this.instanceRepository.getAll();
    }

}