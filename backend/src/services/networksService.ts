import { LowSync } from "lowdb";
import { inject, injectable } from "tsyringe";
import { DbData, DbService } from "./dbService.js";
import { Network } from "../models/networks.js";


@injectable()
export class NetworksService {
    private db: LowSync<DbData>;

    constructor(@inject(DbService) private dbService: DbService) {
        this.db = this.dbService.getDb();
    }

    getAll(): Network[] {
        this.db.read();
        return this.db.data.networks;
    }

    getById(id: string): Network | undefined {
        this.db.read();
        return this.db.data.networks.find(n => n.id === id);
    }

    getByContainerId(containerId: string): Network[] {
        this.db.read();
        return this.db.data.networks.filter(n => n.instance.includes(containerId));
    }

    update(id: string, data: Partial<Network>): Network {
        this.db.read();
        const index = this.db.data.networks.findIndex(n => n.id === id);
        if (index === -1) {
            throw new Error(`network with id ${id} not found`);
        }
        this.db.data.networks[index] = { ...this.db.data.networks[index], ...data };
        this.db.write();
        return this.db.data.networks[index];
    }

    save(network: Network): Network {
        this.db.read();
        this.db.data.networks.push(network);
        this.db.write();
        return network;
    }

    attachContainer(id: string, containerId: string): Network {
        this.db.read();
        const index = this.db.data.networks.findIndex(n => n.id === id);
        if (index === -1) {
            throw new Error(`network with id ${id} not found`);
        }
        if (!this.db.data.networks[index].instance.includes(containerId)) {
            this.db.data.networks[index].instance.push(containerId);
            this.db.write();
        }
        return this.db.data.networks[index];
    }

    detachContainer(id: string, containerId: string): Network {
        this.db.read();
        const index = this.db.data.networks.findIndex(n => n.id === id);
        if (index === -1) {
            throw new Error(`network with id ${id} not found`);
        }
        this.db.data.networks[index].instance = this.db.data.networks[index].instance.filter(c => c !== containerId);
        this.db.write();
        return this.db.data.networks[index];
    }

    remove(id: string): void {
        this.db.read();
        this.db.data.networks = this.db.data.networks.filter(n => n.id !== id);
        this.db.write();
    }
}