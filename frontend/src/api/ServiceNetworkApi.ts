import type { NetworkForm } from "../types/network";

export class ServiceNetworkApi {
    private pathServer: string;

    constructor() {
        this.pathServer = "/api/networks";
    }

    async getAllNetwork() {
        const response = await fetch(this.pathServer);

        if (!response.ok) {
            throw new Error('Error when loading networks');
        }

        return response.json();
    }

    async createNetwork(form: NetworkForm) {
        const response = await fetch(this.pathServer, {
            method: 'POST',
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(form)
        });

        if (!response.ok) {
            throw new Error('Error when creating network');
        }

        return response.json();
    }

    async deleteNetwork(id: string) {
        const response = await fetch(`${this.pathServer}/${id}`, {
            method: 'DELETE'
        })

        if (!response.ok) {
            throw new Error('Error when deleting network');
        }

        return response.json();
    }

    async attachContainer(networkId: string, instanceId: string) {
        const response = await fetch(`${this.pathServer}/${networkId}/attach`, {
            method: 'POST',
            headers: {"Content-Type": "application/json"},
            body: JSON.stringify({instanceId: instanceId})
        });

        if (!response.ok) {
            throw new Error('Error when deleting network');
        }

        return response.json();

    }

    async detachContainer(networkId: string, containerId: string) {
        const response = await fetch(`${this.pathServer}/${networkId}/detach/${containerId}`, {
            method: 'DELETE'
        });

        if (!response.ok) {
            throw new Error('Error when deleting network');
        }

        return response.json();
    }

}