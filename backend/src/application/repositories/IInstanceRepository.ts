import { Instance } from "../../domain/models/instance.js"

export interface IInstanceRepository {
    getAll(): Instance[]
    getById(id: string): Instance | undefined
    save(instance: Instance): Instance
    update(id: string, data: Partial<Instance>): Instance
    remove(id: string): void
}