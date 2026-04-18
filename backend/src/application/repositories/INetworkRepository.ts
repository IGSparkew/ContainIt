import { Network } from "../../domain/models/networks.js"


export interface INetworkRepository {
    getAll(): Network[], 
    getById(id: string): Network | undefined, 
    getByContainerId(containerId: string): Network[]
    save(network: Network): Network, 
    update(id: string, data: Partial<Network>): Network, 
    attachContainer(id: string, containerId: string): Network, 
    detachContainer(id: string, containerId: string): Network, 
    remove(id: string): void
}