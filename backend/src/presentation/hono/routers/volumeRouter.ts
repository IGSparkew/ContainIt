import { Hono } from "hono";
import { honoAdapters } from "../../adapters/honoAdapter.js";
import { GetOrphanVolumeController } from "../../http/controllers/volumes/GetOrphanVolumeController.js";
import { getOrphanVolumeComposer } from "../../../infrastructure/services/composer/volumes/GetOrphanVolumeComposer.js";
import z, { json } from "zod";
import { deleteOrphanVolumeComposer } from "../../../infrastructure/services/composer/volumes/DeleteOrphanVolumeComposer.js";
import { zValidator } from "@hono/zod-validator";
import { httpRequestIdSchema } from "../schemas/httpSchema.js";
import { attachOrphanVolumeComposer } from "../../../infrastructure/services/composer/volumes/AttachOrphanVolumeComposer.js";
import { attachContainerSchema } from "../schemas/network.js";

export const VolumeRouter = new Hono();

VolumeRouter.get('/', async (c) => {
    const adapter = await honoAdapters(c, getOrphanVolumeComposer());
    return c.json(adapter.body, adapter.statusCode);
})

VolumeRouter.delete('/:id', zValidator("param", httpRequestIdSchema), async (c) => {
    const adapter = await honoAdapters(c, deleteOrphanVolumeComposer());
    return c.json(adapter.body, adapter.statusCode);
})

VolumeRouter.post('/:id/attach', zValidator("param", httpRequestIdSchema), zValidator("json", attachContainerSchema), async (c) => {
    const adapter = await honoAdapters(c, attachOrphanVolumeComposer());
    return c.json(adapter.body, adapter.statusCode);
})
