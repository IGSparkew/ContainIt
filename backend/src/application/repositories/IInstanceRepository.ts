import { injectable } from "tsyringe"
import { Instance } from "../../domain/models/instance.js"

@injectable('IInstanceRepository')
export interface IInstanceRepository {
    getAll(): Instance[]
    getById(id: string): Instance | undefined
    save(instance: Instance): Instance
    update(id: string, data: Partial<Instance>): Instance
    remove(id: string): void
}