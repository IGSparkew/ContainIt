import { Volume } from "../models/volumes.js"

export interface AttachVolumeDTO {
    containerId: string
}

export type VolumeResponseDTO = Volume;