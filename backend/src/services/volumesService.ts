import { LowSync } from "lowdb";
import { inject, injectable } from "tsyringe";
import { DbData, DbService } from "./dbService.js";
import { Volume } from "../models/volumes.js";
import { tr } from "zod/locales";


@injectable()
export class VolumesService {
    private db: LowSync<DbData>;

    constructor(@inject(DbService) private dbService: DbService) {
        this.db = this.dbService.getDb();
    }

    getAll() : Volume[] {
        this.db.read();
        return this.db.data.volumes;
    }

    getById(id: string) : Volume | undefined {
        this.db.read();
        return this.db.data.volumes.find(v => v.id == id);
    }

    getByContainerId(containerId: string) {
        this.db.read();
        return this.db.data.volumes.find(v => v.containerId == containerId);
    }

    update(id: string, data : Partial<Volume>) : Volume {
        this.db.read();
        const index = this.db.data.volumes.findIndex(v => v.id == id);
        if (index == -1) {
            throw new Error(`volume with id ${id} not found`);
        }
        this.db.data.volumes[index] = {...this.db.data.volumes[index], ...data};
        this.db.write();
        return this.db.data.volumes[index];
    }

    save(volume: Volume) {
        this.db.read();
        this.db.data.volumes.push(volume);
        this.db.write();
        return volume;
    }

    unlinkVolume(id: string) : Volume {
        return this.update(id, {
            orphan: true,
            containerId: ''
        });
    }

    linkVolume(id: string, containerId: string) : Volume {
        return this.update(id, {
            orphan: false,
            containerId: containerId
        });
    }

    remove(id: string) {
        this.db.read();
        this.db.data.volumes = this.db.data.volumes.filter(v => v.id !== id);
        this.db.write;
    } 

}