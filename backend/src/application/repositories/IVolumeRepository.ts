import { Volume } from "../../domain/models/volumes.js"


export interface IVolumeRepository {
    getAll() : Volume[],
    getById(id: string): Volume | undefined,
    getByContainerId(containerId: string): Volume | undefined
    save(volume: Volume): Volume,
    update(id: string, data: Partial<Volume>): Volume,
    linkVolume(id: string, containerId: string): Volume,
    unlinkVolume(id: string): Volume,
    remove(id: string): void
}