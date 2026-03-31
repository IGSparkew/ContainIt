import { container } from "tsyringe"
import z from "zod"


export const linkVolumeSchema = z.object({
    containerId: z.string().nonoptional()
});


export type LinkVolume = z.infer<typeof linkVolumeSchema>;