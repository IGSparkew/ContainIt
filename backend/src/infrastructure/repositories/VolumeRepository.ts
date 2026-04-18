import { IVolumeRepository } from "../../application/repositories/IVolumeRepository.js";
import { ILowDbClient } from "../../application/providers/ILowDbClient.js";
import { Volume } from "../../domain/models/volumes.js";

export class VolumeRepository implements IVolumeRepository {

    constructor(private client: ILowDbClient) {}

    private get db() {
        return this.client.getDb();
    }

    getAll(): Volume[] {
        this.db.read();
        return this.db.data.volumes;
    }

    getById(id: string): Volume | undefined {
        this.db.read();
        return this.db.data.volumes.find(v => v.id === id);
    }

    getByContainerId(containerId: string): Volume | undefined {
        this.db.read();
        return this.db.data.volumes.find(v => v.containerId === containerId);
    }

    save(volume: Volume): Volume {
        this.db.read();
        this.db.data.volumes.push(volume);
        this.db.write();
        return volume;
    }

    update(id: string, data: Partial<Volume>): Volume {
        this.db.read();
        const index = this.db.data.volumes.findIndex(v => v.id === id);
        if (index === -1) {
            throw new Error(`Volume "${id}" introuvable`);
        }
        this.db.data.volumes[index] = { ...this.db.data.volumes[index], ...data };
        this.db.write();
        return this.db.data.volumes[index];
    }

    linkVolume(id: string, containerId: string): Volume {
        return this.update(id, { containerId, orphan: false });
    }

    unlinkVolume(id: string): Volume {
        return this.update(id, { containerId: '', orphan: true });
    }

    remove(id: string): void {
        this.db.read();
        const index = this.db.data.volumes.findIndex(v => v.id === id);
        if (index === -1) {
            throw new Error(`Volume "${id}" introuvable`);
        }
        this.db.data.volumes.splice(index, 1);
        this.db.write();
    }
}
