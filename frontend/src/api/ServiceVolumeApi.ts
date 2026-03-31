import type { Volume } from "../types/volume";



export class ServiceVolumeApi {
    private pathServer: string;

    constructor() {
        this.pathServer = "/api";
    }

    async fetchOrphanVolumes() : Promise<Volume[]> {
        const response = await fetch(`${this.pathServer}/volumes`);
        if (!response.ok) {
            throw new Error('Error when loading instances');
        }

        return response.json()
    }
}