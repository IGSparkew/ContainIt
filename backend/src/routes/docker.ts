import { Hono } from 'hono'
import { container } from '../registrer.js';
import { DockerController } from '../controller/docker.js';

export const dockerRoute = new Hono();

const controllerDocker: DockerController = container.resolve(DockerController)

dockerRoute.get("/:id/start", async (c) => await controllerDocker.start(c));

dockerRoute.get("/:id/stop", async (c) => await controllerDocker.stop(c));

dockerRoute.get("/:id/stats", async (c) => await controllerDocker.stats(c));



