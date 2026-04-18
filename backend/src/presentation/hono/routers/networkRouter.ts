import { zValidator } from "@hono/zod-validator";
import { Hono } from "hono";
import { honoAdapters } from "../../adapters/honoAdapter.js";
import { getAllNetworksComposer } from "../../../infrastructure/services/composer/networks/GetAllNetworksComposer.js";
import { getNetworkByIdComposer } from "../../../infrastructure/services/composer/networks/GetNetworkByIdComposer.js";
import { createNetworkComposer } from "../../../infrastructure/services/composer/networks/CreateNetworkComposer.js";
import { deleteNetworkComposer } from "../../../infrastructure/services/composer/networks/DeleteNetworkComposer.js";
import { attachContainerToNetworkComposer } from "../../../infrastructure/services/composer/networks/AttachContainerToNetworkComposer.js";
import { detachContainerFromNetworkComposer } from "../../../infrastructure/services/composer/networks/DetachContainerFromNetworkComposer.js";
import { attachContainerSchema, createNetworkSchema, detachContainerPathSchema } from "../schemas/network.js";
import { httpRequestIdSchema } from "../schemas/httpSchema.js";

export const NetworkRouter = new Hono();

NetworkRouter.get('/', async (c) => {
    const adapter = await honoAdapters(c, getAllNetworksComposer());
    return c.json(adapter.body, adapter.statusCode);
})

NetworkRouter.post('/', zValidator('json', createNetworkSchema), async (c) => {
    const adapter = await honoAdapters(c, createNetworkComposer());
    return c.json(adapter.body, adapter.statusCode);
})

NetworkRouter.get('/:id', zValidator('param', httpRequestIdSchema), async (c) => {
    const adapter = await honoAdapters(c, getNetworkByIdComposer());
    return c.json(adapter.body, adapter.statusCode);
})

NetworkRouter.delete('/:id', zValidator('param', httpRequestIdSchema), async (c) => {
    const adapter = await honoAdapters(c, deleteNetworkComposer());
    return c.json(adapter.body, adapter.statusCode);
})

NetworkRouter.post('/:id/attach', zValidator('param', httpRequestIdSchema), zValidator('json', attachContainerSchema), async (c) => {
    const adapter = await honoAdapters(c, attachContainerToNetworkComposer());
    return c.json(adapter.body, adapter.statusCode);
})

NetworkRouter.delete('/:id/detach/:instanceId', zValidator('param', detachContainerPathSchema), async (c) => {
    const adapter = await honoAdapters(c, detachContainerFromNetworkComposer());
    return c.json(adapter.body, adapter.statusCode);
})
