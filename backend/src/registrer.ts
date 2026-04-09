import { container } from "tsyringe";
import { DbService } from "./services/dbService.js";
import { DockerService } from "./services/dockerService.js";
import { ValidationService } from "./services/validationService.js";
import { InstanceController } from "./controller/instance.js";
import { DockerController } from "./controller/docker.js";
import { InstanceService } from "./services/instanceService.js";
import { VolumeController } from "./controller/volume.js";
import { NetworksService } from "./services/networksService.js";
import { NetworkController } from "./controller/networkController.js";


container.registerSingleton(DbService);
container.registerSingleton(InstanceService);
container.registerSingleton(DockerService);
container.registerSingleton(ValidationService);
container.registerSingleton(NetworksService);
container.registerSingleton(NetworkController);

container.registerSingleton(InstanceController);
container.registerSingleton(DockerController);
container.registerSingleton(VolumeController);

export {container}