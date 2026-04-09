import { writable } from "svelte/store";
import { ServiceNetworkApi } from "../api/ServiceNetworkApi";
import type { Network, NetworkForm } from "../types/network";

function createNetworkStore() {

    const api = new ServiceNetworkApi();

    const { subscribe, set, update } = writable<Network[]>([]);
    const isLoading = writable<boolean>(false);
    const error = writable<string | null>(null);

    async function fetchNetworks() {
        isLoading.set(true);
        error.set(null);
        try {
            const data = await api.getAllNetwork();
            set(data);
        } catch (e) {
            error.set(e instanceof Error ? e.message : "Unknown Error");
        } finally {
            isLoading.set(false);
        }
    }

    async function createNetwork(form: NetworkForm) {
        isLoading.set(true);
        error.set(null);
        try {
            const newNetwork = await api.createNetwork(form);
            update(networks => [...networks, newNetwork]);
        } catch (e) {
            error.set(e instanceof Error ? e.message : "Unknown Error");
        } finally {
            isLoading.set(false);
        }
    }

    async function deleteNetwork(id: string) {
        error.set(null);
        try {
            await api.deleteNetwork(id);
            update(networks => networks.filter(n => n.id !== id));
        } catch (e) {
            error.set(e instanceof Error ? e.message : "Unknown Error");
        }
    }

    async function attachContainer(networkId: string, containerId: string) {
        error.set(null);
        try {
            await api.attachContainer(networkId, containerId);
            update(networks => networks.map(n =>
                n.id === networkId
                    ? { ...n, instance: [...n.instance, containerId] }
                    : n
            ));
        } catch (e) {
            error.set(e instanceof Error ? e.message : "Unknown Error");
        }
    }

    async function detachContainer(networkId: string, containerId: string) {
        error.set(null);
        try {
            await api.detachContainer(networkId, containerId);
            update(networks => networks.map(n =>
                n.id === networkId
                    ? { ...n, instance: n.instance.filter(id => id !== containerId) }
                    : n
            ));
        } catch (e) {
            error.set(e instanceof Error ? e.message : "Unknown Error");
        }
    }

    return {
        subscribe,
        isLoading,
        error,
        fetchNetworks,
        createNetwork,
        deleteNetwork,
        attachContainer,
        detachContainer
    };
}

export const networkStore = createNetworkStore();
