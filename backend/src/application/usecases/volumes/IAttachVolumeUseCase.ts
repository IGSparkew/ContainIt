import { AttachContainerDTO } from "../../../domain/dto/network.dot.js";
import { Volume } from "../../../domain/models/volumes.js";

export interface IAttachVolumeUseCase {
    execute(id: string, dto: AttachContainerDTO) : Volume
}