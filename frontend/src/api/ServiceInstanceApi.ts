import type { Instance, InstanceForm } from "../types/instance";


export class ServiceInstanceApi {
    private pathServer: string;

    constructor() {
        this.pathServer = "/api";
    }


    async getAllInstance() : Promise<Instance[]> {
        const response = await fetch(`${this.pathServer}/instances`);
        if (!response.ok) {
            throw new Error('Error when loading instances');
        }

        return response.json()
    }

    async getInstance(id: string) : Promise<Instance> {
        const response = await fetch(`${this.pathServer}/instances/${id}`);
        if (!response.ok) {
            throw new Error('Error when loading instance');
        }

        return response.json();
    }

    async createInstance(instance: InstanceForm) : Promise<Instance> {
        const response = await fetch(`${this.pathServer}/instances`, {
            method: 'POST',
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(instance)
        });

        if (!response.ok) {
            throw new Error('Error when creating instance');
        }

        return response.json();
    }

    async deleteInstance(id: string, keepvolume: boolean) : Promise<void> {
       const response = await fetch(`${this.pathServer}/instances/${id}`, {
            method: 'DELETE',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ keepVolume: keepvolume })
        });
        if (!response.ok) {
            throw new Error('Error when deleting instance ');
        }
    }

    async startInstance(id: string) : Promise<Instance> {
        const response = await fetch(`${this.pathServer}/instances/${id}/start`, {
            method: 'POST'
        });

        if (!response.ok) {
            throw new Error('Error when starting instances');
        }

        return response.json();
    }

    async stopInstance(id: string) : Promise<Instance> {
        const response = await fetch(`${this.pathServer}/instances/${id}/stop`, {
            method: 'POST'
        });

        if (!response.ok) {
            throw new Error('Error when starting instances');
        }

        return response.json();
    }

    async statsOfInstance(id: string) : Promise<{cpu: number, memory: number}> {
        const response = await fetch(`${this.pathServer}/instances/${id}/stats`);

        if (!response.ok) {
            throw new Error('Error when stats instance');
        }

        return response.json();
    }

}