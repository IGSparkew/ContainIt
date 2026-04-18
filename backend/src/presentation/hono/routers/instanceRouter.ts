import { zValidator } from "@hono/zod-validator";
import { Hono } from "hono";
import { honoAdapters } from "../../adapters/honoAdapter.js";
import { createInstanceComposer } from "../../../infrastructure/services/composer/CreateInstanceComposer.js";
import { getAllInstancesComposer } from "../../../infrastructure/services/composer/instances/GetAllInstancesComposer.js";
import { getInstanceByIdComposer } from "../../../infrastructure/services/composer/instances/GetInstanceByIdComposer.js";
import { deleteInstanceComposer } from "../../../infrastructure/services/composer/instances/DeleteInstanceComposer.js";
import { startInstanceComposer } from "../../../infrastructure/services/composer/instances/StartInstanceComposer.js";
import { stopInstanceComposer } from "../../../infrastructure/services/composer/instances/StopInstanceComposer.js";
import { getInstanceStatsComposer } from "../../../infrastructure/services/composer/instances/GetInstanceStatsComposer.js";
import { createInstanceSchema, deleteInstanceSchema } from "../schemas/Instance.js";
import { httpRequestIdSchema } from "../schemas/httpSchema.js";

export const InstanceRouter = new Hono();

InstanceRouter.get('/', async (c) => {
    const adapter = await honoAdapters(c, getAllInstancesComposer());
    return c.json(adapter.body, adapter.statusCode);
})

InstanceRouter.post('/', zValidator('json', createInstanceSchema), async (c) => {
    const adapter = await honoAdapters(c, createInstanceComposer());
    return c.json(adapter.body, adapter.statusCode);
})

InstanceRouter.get('/:id', zValidator('param', httpRequestIdSchema), async (c) => {
    const adapter = await honoAdapters(c, getInstanceByIdComposer());
    return c.json(adapter.body, adapter.statusCode);
})

InstanceRouter.delete('/:id', zValidator('param', httpRequestIdSchema), zValidator('json', deleteInstanceSchema), async (c) => {
    const adapter = await honoAdapters(c, deleteInstanceComposer());
    return c.json(adapter.body, adapter.statusCode);
})

InstanceRouter.post('/:id/start', zValidator('param', httpRequestIdSchema), async (c) => {
    const adapter = await honoAdapters(c, startInstanceComposer());
    return c.json(adapter.body, adapter.statusCode);
})

InstanceRouter.post('/:id/stop', zValidator('param', httpRequestIdSchema), async (c) => {
    const adapter = await honoAdapters(c, stopInstanceComposer());
    return c.json(adapter.body, adapter.statusCode);
})

InstanceRouter.get('/:id/stats', zValidator('param', httpRequestIdSchema), async (c) => {
    const adapter = await honoAdapters(c, getInstanceStatsComposer());
    return c.json(adapter.body, adapter.statusCode);
})
