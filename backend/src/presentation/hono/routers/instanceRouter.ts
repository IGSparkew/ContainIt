import { zValidator } from "@hono/zod-validator";
import { Hono } from "hono";
import { createInstanceSchema } from "../schemas/Instance.js";
import { honoAdapters } from "../../adapters/honoAdapter.js";
import { createInstanceComposer } from "../../../infrastructure/services/composer/CreateInstanceComposer.js";

export const InstanceRouter = new Hono();


// Create Instance
InstanceRouter.post('/',zValidator('json', createInstanceSchema), async (c) => {
    const adapter = await honoAdapters(c, createInstanceComposer());
    return c.json(adapter.body, adapter.statusCode);
})