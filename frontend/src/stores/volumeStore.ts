import { writable } from 'svelte/store';
import { ServiceVolumeApi } from '../api/ServiceVolumeApi';
import type { Volume } from '../types/volume';

function createVolumeStore() {

    const api = new ServiceVolumeApi();

    const {subscribe, set} = writable<Volume[]>([]);

    const error = writable<string | null>(null)

    async function fetchOrphanVolumes() {
       try {
        const data = await api.fetchOrphanVolumes();
        set(data);
       } catch(e) {
        error.set(e instanceof Error ? e.message : "Unknown Error");
       }
    }

    return {
        subscribe,
        error,
        fetchOrphanVolumes
    }
}


export const volumeStore = createVolumeStore();