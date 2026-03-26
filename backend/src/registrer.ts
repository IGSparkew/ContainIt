import { container } from "tsyringe";
import { DbService } from "./services/dbService.js";
import { DockerService } from "./services/dockerService.js";
import { ValidationService } from "./services/validationService.js";
import { InstanceController } from "./controller/instance.js";
import { DockerController } from "./controller/docker.js";


container.registerSingleton(DbService);
container.registerSingleton(DockerService);
container.registerSingleton(ValidationService);

container.registerSingleton(InstanceController);
container.registerSingleton(DockerController);

export {container}