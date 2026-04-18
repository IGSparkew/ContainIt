import { injectable } from 'tsyringe'
import Dockerode from 'dockerode'
import * as net from 'net'

import { IDockerPort } from '../../application/repositories/IDockerPort.js'
import { CreateInstanceDTO } from '../../domain/dto/instance.dto.js'
import { AdminToolType, CreateInstanceResult } from '../../domain/models/instance.js'
import { NetworkDriverEnum } from '../../domain/models/networks.js'
import { Stats } from '../../domain/models/stats.js'
import { DB_DATA_PATHS, ADMIN_TOOL_CONFIG, CONTAINIT_PREFIX, DB_ENV_VARS, DB_IMAGE_NAMES, DB_INTERNAL_PORTS, DEFAULT_PORT_SCAN_START } from './DockerSettings.js'


/**
 * Infrastructure implementation of IDockerPort.
 * Wraps the Dockerode client and exposes all Docker operations
 * required by the application use cases.
 */
@injectable()
export class DockerPort implements IDockerPort {
    private docker: Dockerode

    constructor() {
        this.docker = new Dockerode(this.buildDockerConfig())
    }

    // ── Private helpers ───────────────────────────────────────────────────────

    /**
     * Builds the Dockerode connection options based on the environment.
     * Prefers a TCP host when DOCKER_HOST is set, otherwise falls back
     * to the platform-appropriate Unix/named-pipe socket.
     */
    private buildDockerConfig(): Dockerode.DockerOptions {
        if (process.env.DOCKER_HOST) {
            return {
                host: process.env.DOCKER_HOST,
                port: parseInt(process.env.DOCKER_PORT ?? '2375'),
            }
        }

        return process.platform === 'win32'
            ? { socketPath: '//./pipe/docker_engine' }
            : { socketPath: '/var/run/docker.sock' }
    }

    /**
     * Checks whether a Docker image is already present in the local cache.
     */
    private async imageExists(image: string): Promise<boolean> {
        try {
            await this.docker.getImage(image).inspect()
            return true
        } catch {
            return false
        }
    }

    /**
     * Pulls a Docker image from the registry and waits for the transfer
     * to complete before resolving.
     */
    private async pullImage(image: string): Promise<void> {
        return new Promise((resolve, reject) => {
            this.docker.pull(image, (err: Error, stream: NodeJS.ReadableStream) => {
                if (err) return reject(new Error(`Failed to start pull for image "${image}": ${err.message}`))

                this.docker.modem.followProgress(stream, (err) => {
                    if (err) return reject(new Error(`Image pull failed for "${image}": ${err.message}`))
                    resolve()
                })
            })
        })
    }

    /**
     * Ensures an image is available locally, pulling it first if needed.
     */
    private async ensureImage(image: string): Promise<void> {
        const exists = await this.imageExists(image)
        if (!exists) {
            console.log(`Image "${image}" not found locally — pulling from registry…`)
            await this.pullImage(image)
            console.log(`Image "${image}" is ready`)
        }
    }

    /**
     * Creates a named Docker volume prefixed with the ContainIt namespace
     * and returns the full volume name.
     */
    private async createVolume(name: string): Promise<string> {
        const volumeName = `${CONTAINIT_PREFIX}${name.trim()}`
        await this.docker.createVolume({ Name: volumeName })
        return volumeName
    }

    // ── IDockerPort implementation ────────────────────────────────────────────

    /**
     * Creates a new database container.
     * If `isAlreadyCreatedVolume` is false a new Docker volume is created;
     * otherwise the existing volume identified by `existingVolumeName` is reused.
     *
     * The container is stopped immediately after creation so that callers
     * can start it explicitly with `startInstance`.
     */
    async createInstance(
        config: CreateInstanceDTO,
        volumeId: string,
        isAlreadyCreatedVolume: boolean,
        existingVolumeName?: string,
    ): Promise<CreateInstanceResult> {
        const imageName = DB_IMAGE_NAMES[config.type]
        if (!imageName) {
            throw new Error(`Unsupported database type: "${config.type}"`)
        }

        const imageTag  = config.version ?? 'latest'
        const fullImage = `${imageName}:${imageTag}`

        await this.ensureImage(fullImage)

        // Resolve or create the volume
        let volumeName: string
        if (isAlreadyCreatedVolume) {
            if (!existingVolumeName) {
                throw new Error('existingVolumeName must be provided when isAlreadyCreatedVolume is true')
            }
            volumeName = this.docker.getVolume(existingVolumeName).name
        } else {
            volumeName = await this.createVolume(`${config.name}-${volumeId}-volume`)
        }

        const internalPort = DB_INTERNAL_PORTS[config.type]
        const dataPath     = DB_DATA_PATHS[config.type]

        const container = await this.docker.createContainer({
            Image: fullImage,
            name:  `${CONTAINIT_PREFIX}${config.name.trim()}`,
            Env:   DB_ENV_VARS[config.type](config.password!),
            HostConfig: {
                Binds: [`${volumeName}:${dataPath}`],
                PortBindings: {
                    [`${internalPort}/tcp`]: [{ HostPort: config.port!.toString() }],
                },
                RestartPolicy: { Name: 'unless-stopped' },
            },
        })

        // Stop immediately — callers use startInstance to bring it up
        try {
            await container.stop()
        } catch {
            // Container is already stopped — nothing to do
        }

        return { containerId: container.id, volumeName }
    }

    /**
     * Starts an existing container.
     * Throws if the container does not exist or Docker returns an error.
     */
    async startInstance(containerId: string): Promise<void> {
        const container = this.docker.getContainer(containerId)
        try {
            await container.start()
        } catch (err: any) {
            throw new Error(`Failed to start container "${containerId}": ${err.message}`)
        }
    }

    /**
     * Stops a running container.
     * Throws if the container does not exist or Docker returns an error.
     */
    async stopInstance(containerId: string): Promise<void> {
        const container = this.docker.getContainer(containerId)
        try {
            await container.stop()
        } catch (err: any) {
            throw new Error(`Failed to stop container "${containerId}": ${err.message}`)
        }
    }

    /**
     * Stops and removes a container.
     * If `keepVolume` is false and `volumeName` is provided, the associated
     * Docker volume is also deleted.
     */
    async deleteInstance(containerId: string, keepVolume: boolean, volumeName?: string): Promise<void> {
        const container = this.docker.getContainer(containerId)

        // Attempt to stop first — ignore errors if already stopped
        try {
            await container.stop()
        } catch {
            // Container is already stopped — nothing to do
        }

        try {
            await container.remove()
        } catch (err: any) {
            throw new Error(`Failed to remove container "${containerId}": ${err.message}`)
        }

        if (!keepVolume && volumeName !== undefined) {
            try {
                await this.docker.getVolume(volumeName).remove()
            } catch (err: any) {
                throw new Error(`Failed to remove volume "${volumeName}": ${err.message}`)
            }
        }
    }

    /**
     * Returns the live status of a container.
     * Returns `'error'` when the container cannot be inspected (e.g. not found).
     */
    async getStatus(containerId: string): Promise<'running' | 'stopped' | 'error'> {
        try {
            const data = await this.docker.getContainer(containerId).inspect()
            return data.State.Running ? 'running' : 'stopped'
        } catch {
            return 'error'
        }
    }

    /**
     * Fetches a single-shot stats snapshot for a container and returns
     * CPU usage (%) and memory usage (MB).
     */
    async getStats(containerId: string): Promise<Stats> {
        const container = this.docker.getContainer(containerId)

        let raw: any
        try {
            raw = await container.stats({ stream: false })
        } catch (err: any) {
            throw new Error(`Failed to retrieve stats for container "${containerId}": ${err.message}`)
        }

        // CPU percentage calculation
        const cpuDelta    = raw.cpu_stats.cpu_usage.total_usage - raw.precpu_stats.cpu_usage.total_usage
        const systemDelta = raw.cpu_stats.system_cpu_usage      - raw.precpu_stats.system_cpu_usage
        const cpuPercent  = (cpuDelta / systemDelta) * raw.cpu_stats.online_cpus * 100

        // Memory in megabytes
        const memoryMB = raw.memory_stats.usage / 1024 / 1024

        return {
            cpu:    Math.round(cpuPercent * 100) / 100,
            memory: Math.round(memoryMB  * 100) / 100,
        }
    }

    /**
     * Creates a Docker network with the ContainIt prefix.
     * Defaults to the `bridge` driver when none is specified.
     */
    async createNetwork(name: string, driver: NetworkDriverEnum = 'bridge'): Promise<{ dockerId: string }> {
        try {
            const network = await this.docker.createNetwork({
                Name:   `${CONTAINIT_PREFIX}${name}`,
                Driver: driver,
            })
            return { dockerId: network.id }
        } catch (err: any) {
            throw new Error(`Failed to create network "${name}": ${err.message}`)
        }
    }

    /**
     * Removes a Docker network by its Docker-assigned ID.
     */
    async removeNetwork(dockerId: string): Promise<void> {
        try {
            await this.docker.getNetwork(dockerId).remove()
        } catch (err: any) {
            throw new Error(`Failed to remove network "${dockerId}": ${err.message}`)
        }
    }

    /**
     * Connects a container to a Docker network.
     */
    async connectContainer(dockerNetworkId: string, containerId: string): Promise<void> {
        try {
            await this.docker.getNetwork(dockerNetworkId).connect({ Container: containerId })
        } catch (err: any) {
            throw new Error(
                `Failed to connect container "${containerId}" to network "${dockerNetworkId}": ${err.message}`,
            )
        }
    }

    /**
     * Disconnects a container from a Docker network.
     */
    async disconnectContainer(dockerNetworkId: string, containerId: string): Promise<void> {
        try {
            await this.docker.getNetwork(dockerNetworkId).disconnect({ Container: containerId })
        } catch (err: any) {
            throw new Error(
                `Failed to disconnect container "${containerId}" from network "${dockerNetworkId}": ${err.message}`,
            )
        }
    }

    /**
     * Creates an admin-tool container (Adminer, mongo-express, RedisInsight…),
     * attaches it to the given network, and returns the new container ID.
     */
    async createAdminTool(
        toolType: AdminToolType,
        name: string,
        hostPort: number,
        networkDockerId: string,
        env: string[] = [],
    ): Promise<string> {
        const toolConfig = ADMIN_TOOL_CONFIG[toolType]
        if (!toolConfig) {
            throw new Error(`Unsupported admin tool type: "${toolType}"`)
        }

        const { image, internalPort } = toolConfig

        await this.ensureImage(image)

        const container = await this.docker.createContainer({
            Image: image,
            name:  `${CONTAINIT_PREFIX}${name.trim()}`,
            Env:   env.length > 0 ? env : undefined,
            HostConfig: {
                PortBindings: {
                    [`${internalPort}/tcp`]: [{ HostPort: hostPort.toString() }],
                },
                RestartPolicy: { Name: 'unless-stopped' },
            },
        })

        await this.connectContainer(networkDockerId, container.id)
        return container.id
    }

    /**
     * Probes a TCP port on the local machine to check whether it is free.
     * Resolves when the port is available; rejects with a descriptive error
     * when it is already in use.
     */
    checkPortAvailable(port: number): Promise<void> {
        return new Promise((resolve, reject) => {
            const server = net.createServer()

            server.once('error', () => {
                reject(new Error(`Port ${port} is already in use`))
            })

            server.once('listening', () => {
                server.close()
                resolve()
            })

            server.listen(port)
        })
    }

    /**
     * Scans ports sequentially starting from `startFrom` and returns the
     * first port that is free on the local machine.
     *
     * @throws When no free port is found up to 65535.
     */
    async findFreePort(startFrom = DEFAULT_PORT_SCAN_START): Promise<number> {
        let port = startFrom

        while (port <= 65535) {
            try {
                await this.checkPortAvailable(port)
                return port
            } catch {
                port++
            }
        }

        throw new Error(`No free port available between ${startFrom} and 65535`)
    }
}
