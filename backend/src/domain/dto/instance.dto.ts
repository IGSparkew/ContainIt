import { Instance, InstanceType } from "../models/instance.js"

export interface CreateInstanceDTO {
    name: string,
    type: InstanceType,
    port?: number,
    password?: string,
    version?: string,
    volumeId?: string,
    networkId?: string 
}

export interface UpdateInstanceDTO {
    name: string,
    port?: number,
    password?: string,
    version?: string,
}

export type InstanceResponseDTO = Instance;