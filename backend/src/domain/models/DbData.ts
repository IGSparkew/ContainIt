import { Instance } from "./instance.js";
import { Network } from "./networks.js";
import { Volume } from "./volumes.js";

export type DbData = { instances: Instance[], volumes: Volume[], networks: Network[] };