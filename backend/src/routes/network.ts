import { zValidator } from '@hono/zod-validator';
import { Hono } from 'hono'
import { container } from 'tsyringe';
import { NetworkController } from '../controller/networkController.js';
import { attachContainerSchema, createNetworkSchema } from '../presentation/hono/schemas/network.js';

export const networkRoute = new Hono();

const controllerNetwork: NetworkController = container.resolve(NetworkController)

networkRoute.get('/', (c) => controllerNetwork.getAllNetworks(c));
networkRoute.get('/:id', (c) => controllerNetwork.getNetwork(c));
networkRoute.post('/', zValidator('json', createNetworkSchema), async (c) => await controllerNetwork.createNetwork(c));
networkRoute.delete('/:id', async (c) => await controllerNetwork.deleteNetwork(c));
networkRoute.post('/:id/attach', zValidator('json', attachContainerSchema), async (c) => await controllerNetwork.attachContainer(c));
networkRoute.delete('/:id/detach/:instanceId', async (c) => await controllerNetwork.detachContainer(c));
