import { Volume } from "../../../domain/models/volumes.js";

export interface IGetOrphanVolumesUseCase {
    execute() : Volume[]
}