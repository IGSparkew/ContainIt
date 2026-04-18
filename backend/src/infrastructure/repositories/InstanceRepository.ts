import { IInstanceRepository } from "../../application/repositories/IInstanceRepository.js";
import { ILowDbClient } from "../../application/providers/ILowDbClient.js";
import { Instance } from "../../domain/models/instance.js";

export class InstanceRepository implements IInstanceRepository {

    constructor(private client: ILowDbClient) {}

    private get db() {
        return this.client.getDb();
    }

    getAll(): Instance[] {
        this.db.read();
        return this.db.data.instances;
    }

    getById(id: string): Instance | undefined {
        this.db.read();
        return this.db.data.instances.find(i => i.id === id);
    }

    save(instance: Instance): Instance {
        this.db.read();
        this.db.data.instances.push(instance);
        this.db.write();
        return instance;
    }

    update(id: string, data: Partial<Instance>): Instance {
        this.db.read();
        const index = this.db.data.instances.findIndex(i => i.id === id);
        if (index === -1) {
            throw new Error(`Instance "${id}" introuvable`);
        }
        this.db.data.instances[index] = { ...this.db.data.instances[index], ...data };
        this.db.write();
        return this.db.data.instances[index];
    }

    remove(id: string): void {
        this.db.read();
        const index = this.db.data.instances.findIndex(i => i.id === id);
        if (index === -1) {
            throw new Error(`Instance "${id}" introuvable`);
        }
        this.db.data.instances.splice(index, 1);
        this.db.write();
    }
}
