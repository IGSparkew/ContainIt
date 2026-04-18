import { zValidator } from '@hono/zod-validator';
import { Hono } from 'hono'
import { container } from 'tsyringe';
import { createInstanceSchema } from '../presentation/hono/schemas/Instance.js';
import { InstanceController } from '../controller/instance.js';

export const instancesRoute = new Hono();

const controllerInstance: InstanceController = container.resolve(InstanceController)

instancesRoute.get("/", (c) => controllerInstance.getAllInstance(c));

instancesRoute.get("/:id", (c) => controllerInstance.getInstance(c));

instancesRoute.post('/',zValidator('json', createInstanceSchema), async (c) => await controllerInstance.createInstance(c));

instancesRoute.delete('/:id',  async (c) => controllerInstance.deleteInstance(c));