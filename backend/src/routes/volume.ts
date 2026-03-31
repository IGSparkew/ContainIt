import { zValidator } from '@hono/zod-validator';
import { Hono } from 'hono'
import { container } from 'tsyringe';
import { VolumeController } from '../controller/volume.js';
import { linkVolumeSchema } from '../schemas/volume.js';

export const volumeRoute = new Hono();

const controllerVolume: VolumeController = container.resolve(VolumeController)

volumeRoute.get("/", (c) => controllerVolume.getAllOrphanVolumes(c));

volumeRoute.post('/:id/attach',zValidator('json', linkVolumeSchema), async (c) => await controllerVolume.attachVolume(c));

volumeRoute.delete('/:id',  async (c) => controllerVolume.deleteOrphan(c));