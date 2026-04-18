import { inject, injectable } from "tsyringe";
import { VolumesService } from "../services/volumesService.js";
import { Context } from "hono";
import { ValidationService } from "../services/validationService.js";
import { LinkVolume } from "../presentation/hono/schemas/volume.js";
import { DockerService } from "../services/dockerService.js";



@injectable()
export class VolumeController {

    constructor(
        @inject(VolumesService) private volumeService: VolumesService,
        @inject(ValidationService) private validationService: ValidationService
    ) {}


    getAllOrphanVolumes(c: Context) {
        const volumes = this.volumeService.getAll();
        const orphanVolumes = volumes.filter(v => v.orphan == true);
        return c.json(orphanVolumes, 200);
    }

    deleteOrphan(c: Context) {
        const id = c.req.param('id');
        if (!id) {
             return c.json({"message": "Error wrong id"});
        }

        this.validationService.checkVolumeExist(id);
        this.validationService.checkVolumeOrphan(id);
    
        this.volumeService.remove(id);

       return c.json({"message":"remove orphan volume with id: " + id}, 200); 
    }

    async attachVolume(c: Context) {
        const id = c.req.param('id');
        const body = await c.req.json<LinkVolume>();
        if (!id) {
             return c.json({"message": "Error wrong id"});
        }

        this.validationService.checkVolumeExist(id);
        this.validationService.checkVolumeOrphan(id);

        return c.json(this.volumeService.linkVolume(id, body.containerId), 200);
    }

}