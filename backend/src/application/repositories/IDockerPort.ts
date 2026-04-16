import { CreateInstanceDTO } from "../../domain/dto/instance.dto.js";
import { AdminToolType, CreateInstanceResult } from "../../domain/models/instance.js";
import { NetworkDriverEnum } from "../../domain/models/networks.js";
import { Stats } from "../../domain/models/stats.js";

export interface IDockerPort {
    createInstance(config: CreateInstanceDTO, volumeId: string, isAlreadyCreatedVolume: boolean, existingVolumeName?: string): Promise<CreateInstanceResult>,
    startInstance(containerId: string): Promise<void>,
    stopInstance(containerId: string): Promise<void>,
    deleteInstance(containerId: string, keepVolume: boolean, volumeName?: string | undefined): Promise<void>,
    getStatus(containerId: string): Promise<'running'|'stopped'|'error'>,
    getStats(containerId: string): Promise<Stats>,
    createNetwork(name: string, driver?: NetworkDriverEnum): Promise<{ dockerId: string }>,
    removeNetwork(dockerId: string): Promise<void>,
    connectContainer(dockerNetworkId: string, containerId: string): Promise<void>,
    disconnectContainer(dockerNetworkId: string, containerId: string): Promise<void>,
    createAdminTool(toolType: AdminToolType, name: string, hostPort: number, networkDockerId: string, env: string[]): Promise<string>,
    findFreePort(startFrom?: number): Promise<number>,
    checkPortAvailable(port: number): Promise<void>,
}