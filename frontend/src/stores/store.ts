import { writable } from 'svelte/store';
import type { Instance, InstanceForm } from '../types/instance';
import { ServiceInstanceApi } from '../api/ServiceInstanceApi';
import type { Stats } from '../types/states';

function createInstanceStore() {

    const api = new ServiceInstanceApi();
    
    const {subscribe, update, set} = writable<Instance[]>([]);
    const stats = writable<Stats | null>(null); 
    const isLoading = writable<boolean>(false);
    const error = writable<string | null>(null);

    async function fetchAllInstances() {
        isLoading.set(true);
        error.set(null);
        try {
            const data = await api.getAllInstance();
            set(data);
        } catch (e) {
            error.set(e instanceof Error ? e.message : "Unknown Error");
        } finally {
            isLoading.set(false);
        }
    }

    async function addInstance(instance: InstanceForm) {
        isLoading.set(true);
        error.set(null);
        try {
            const data = await api.createInstance(instance);
            update(list => [...list, data]);
        } catch (e) {
            error.set(e instanceof Error ? e.message : "Unknown Error");
        } finally {
            isLoading.set(false);
        }
    }

    async function deleteInstance(id: string) {
        isLoading.set(true);
        error.set(null);
        try {
            await api.deleteInstance(id);
            update(list => list.filter(l => l.id !== id));
        } catch (e) {
            error.set(e instanceof Error ? e.message : "Unknown Error");
        } finally {
            isLoading.set(false);
        }
    }

    async function startInstance(id: string) {
        error.set(null);
         try {
           const updatedInstance = await api.startInstance(id);
            update(list => list.map(l => l.id == id ? updatedInstance : l));
        } catch (e) {
            error.set(e instanceof Error ? e.message : "Unknown Error");
        }
    }

    async function stopInstance(id: string) {
        error.set(null);
         try {
           const updatedInstance = await api.stopInstance(id);
           update(list => list.map(l => l.id == id ? updatedInstance : l));
        } catch (e) {
            error.set(e instanceof Error ? e.message : "Unknown Error");
        }
    }

    async function fetchStatInstance(id: string) {
         try {
           const fetchedStats = await api.statsOfInstance(id);
           stats.set(fetchedStats);
        } catch (e) {
            error.set(e instanceof Error ? e.message : "Unknown Error");
        }
    }

    return {
        subscribe,
        isLoading,
        error,
        stats,
        fetchAllInstances,
        addInstance,
        deleteInstance,
        startInstance,
        stopInstance,
        fetchStatInstance
    };
}


export const instanceStore = createInstanceStore();


