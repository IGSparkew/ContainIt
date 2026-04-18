import { Network, NetworkDriverEnum } from "../models/networks.js";

export interface CreateNetworkDTO {
    name: string,
    driver: NetworkDriverEnum
}

export interface AttachContainerDTO {
    instanceId: string
}

export type NetworkResponseDTO = Network;