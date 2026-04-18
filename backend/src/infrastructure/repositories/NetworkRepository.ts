import { INetworkRepository } from "../../application/repositories/INetworkRepository.js";
import { ILowDbClient } from "../../application/providers/ILowDbClient.js";
import { Network } from "../../domain/models/networks.js";

export class NetworkRepository implements INetworkRepository {

    constructor(private client: ILowDbClient) {}

    private get db() {
        return this.client.getDb();
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

    save(network: Network): Network {
        this.db.read();
        this.db.data.networks.push(network);
        this.db.write();
        return network;
    }

    update(id: string, data: Partial<Network>): Network {
        this.db.read();
        const index = this.db.data.networks.findIndex(n => n.id === id);
        if (index === -1) {
            throw new Error(`Network "${id}" introuvable`);
        }
        this.db.data.networks[index] = { ...this.db.data.networks[index], ...data };
        this.db.write();
        return this.db.data.networks[index];
    }

    attachContainer(id: string, containerId: string): Network {
        this.db.read();
        const index = this.db.data.networks.findIndex(n => n.id === id);
        if (index === -1) {
            throw new Error(`Network "${id}" introuvable`);
        }
        if (!this.db.data.networks[index].instance.includes(containerId)) {
            this.db.data.networks[index].instance.push(containerId);
        }
        this.db.write();
        return this.db.data.networks[index];
    }

    detachContainer(id: string, containerId: string): Network {
        this.db.read();
        const index = this.db.data.networks.findIndex(n => n.id === id);
        if (index === -1) {
            throw new Error(`Network "${id}" introuvable`);
        }
        this.db.data.networks[index].instance = this.db.data.networks[index].instance.filter(
            i => i !== containerId
        );
        this.db.write();
        return this.db.data.networks[index];
    }

    remove(id: string): void {
        this.db.read();
        const index = this.db.data.networks.findIndex(n => n.id === id);
        if (index === -1) {
            throw new Error(`Network "${id}" introuvable`);
        }
        this.db.data.networks.splice(index, 1);
        this.db.write();
    }
}
