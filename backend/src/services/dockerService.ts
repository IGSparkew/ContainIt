import { injectable } from 'tsyringe'
import Dockerode from 'dockerode'
import { CreateInstanceInput } from '../schemas/Instance.js'
import { Stats } from '../models/stats.js';
import { AdminToolType, CreateInstanceResult } from '../models/instance.js';
import { NetworkDriverEnum } from '../models/networks.js';


// Variables d'env spécifiques à chaque type de BDD
const ENV_VARS: Record<string, (password: string) => string[]> = {
  postgres: (pwd) => [
    `POSTGRES_PASSWORD=${pwd}`,
    `POSTGRES_USER=admin`,
  ],
  mysql: (pwd) => [
    `MYSQL_ROOT_PASSWORD=${pwd}`,
    `MYSQL_USER=admin`,
    `MYSQL_PASSWORD=${pwd}`,
  ],
  mongo: (pwd) => [
    `MONGO_INITDB_ROOT_USERNAME=admin`,
    `MONGO_INITDB_ROOT_PASSWORD=${pwd}`,
  ],
  redis: (pwd) => [
    `REDIS_PASSWORD=${pwd}`,
  ],
}

const ENV_NAME_INSTANCE = "containit-"

export const ADMIN_TOOL_CONFIG: Record<AdminToolType, { image: string; internalPort: number }> = {
  'adminer':       { image: 'adminer',            internalPort: 8080 },
  'mongo-express': { image: 'mongo-express',      internalPort: 8081 },
  'redisinsight':  { image: 'redis/redisinsight', internalPort: 5540 },
}

// Nom de l'image Docker pour chaque type
const IMAGE_NAMES: Record<string, string> = {
  postgres: 'postgres',
  mysql: 'mysql',
  mongo: 'mongo',
  redis: 'redis',
}

@injectable()
export class DockerService {
  private docker: Dockerode

  constructor() {
      this.docker = new Dockerode(this.getDockerConfig())
  }

  private getDockerConfig(): Dockerode.DockerOptions {
  if (process.env.DOCKER_HOST) {
    return {
      host: process.env.DOCKER_HOST,
      port: parseInt(process.env.DOCKER_PORT ?? '2375')
    }
  }

  switch (process.platform) {
    case 'win32':
      return { socketPath: '//./pipe/docker_engine' }
    default:
      return { socketPath: '/var/run/docker.sock' }
  }
}

  // Pull l'image si elle n'est pas présente localement
  private async pullImage(image: string): Promise<void> {
    return new Promise((resolve, reject) => {
      this.docker.pull(image, (err: Error, stream: NodeJS.ReadableStream) => {
        if (err) return reject(err)

        // Attend la fin du pull
        this.docker.modem.followProgress(stream, (err) => {
          if (err) return reject(err)
          resolve()
        })
      })
    })
  }

  // Vérifie si l'image est déjà présente localement
  private async imageExists(image: string): Promise<boolean> {
    try {
      await this.docker.getImage(image).inspect()
      return true
    } catch {
      return false
    }
  }

  private getDataPath(type: string): string {
  const paths: Record<string, string> = {
    postgres: '/var/lib/postgresql/data',
    mysql:    '/var/lib/mysql',
    mongo:    '/data/db',
    redis:    '/data'
  }
  return paths[type]
}

  // Crée un volume 
  private async createVolume(name :string) {
    const volumeName = `${ENV_NAME_INSTANCE}${name.trim()}`; 
    await this.docker.createVolume({Name: volumeName});
    return volumeName;
  }

  // Crée un conteneur
  async createInstance(config: CreateInstanceInput, volumeId: string, isAlreadyCreatedVolume: boolean, existingVolumeName?: string): Promise<CreateInstanceResult> {
    const imageName = IMAGE_NAMES[config.type]
    const imageTag = config.version ?? 'latest'
    const fullImage = `${imageName}:${imageTag}`

    // Pull uniquement si l'image est absente
    const exists = await this.imageExists(fullImage)
    if (!exists) {
      console.log(`Pull de l'image ${fullImage}...`)
      await this.pullImage(fullImage)
      console.log(`Image ${fullImage} prête`)
    }
    
    let volumeName = "";
    if (!isAlreadyCreatedVolume) {
      volumeName = await this.createVolume(`${config.name}-${volumeId}-volume`);
    } else {
      volumeName = this.docker.getVolume(existingVolumeName!).name;
    }

    // Crée le conteneur
    const container = await this.docker.createContainer({
      Image: fullImage,
      name: `${ENV_NAME_INSTANCE}${config.name.trim()}`,
      Env: ENV_VARS[config.type](config.password!),
      HostConfig: {
        Binds: [
          `${volumeName}:${this.getDataPath(config.type)}`
        ],
        PortBindings: {
          // Mappe le port interne du conteneur sur le port choisi par l'utilisateur
          [`${this.getInternalPort(config.type)}/tcp`]: [
            { HostPort: config.port!.toString() }
          ]
        },
        RestartPolicy: { Name: 'unless-stopped' }
      }
    })

    try {
      await container.stop()
    } catch {
      // Conteneur déjà arrêté — pas grave
    }

    return {
      containerId: container.id,
      volumeName
    }
  }

  // Démarre un conteneur existant
  async startInstance(containerId: string): Promise<void> {
    const container = this.docker.getContainer(containerId)
    await container.start()
  }

  // Arrête un conteneur
  async stopInstance(containerId: string): Promise<void> {
    const container = this.docker.getContainer(containerId)
    await container.stop()
  }

  // Arrête et supprime un conteneur
  async deleteInstance(containerId: string, keepVolume: boolean, volumeName?:string): Promise<void> {
    const container = this.docker.getContainer(containerId)

    // On tente le stop mais on continue même s'il est déjà arrêté
    try {
      await container.stop()
    } catch {
      // Conteneur déjà arrêté — pas grave
    }

    await container.remove();

    if (!keepVolume && volumeName !== undefined ) {
      await this.docker.getVolume(volumeName).remove();
    }
  }

  // Récupère le statut live depuis Docker
  async getStatus(containerId: string): Promise<'running' | 'stopped' | 'error'> {
    try {
      const data = await this.docker.getContainer(containerId).inspect()
      return data.State.Running ? 'running' : 'stopped'
    } catch {
      return 'error'
    }
  }

  // Stats CPU / RAM — v2
  async getStats(containerId: string): Promise<Stats> {
    const container = this.docker.getContainer(containerId)
    const stats = await container.stats({ stream: false }) as any

    // Calcul CPU en pourcentage
    const cpuDelta = stats.cpu_stats.cpu_usage.total_usage - stats.precpu_stats.cpu_usage.total_usage
    const systemDelta = stats.cpu_stats.system_cpu_usage - stats.precpu_stats.system_cpu_usage
    const cpuPercent = (cpuDelta / systemDelta) * stats.cpu_stats.online_cpus * 100

    // RAM en MB
    const memoryMB = stats.memory_stats.usage / 1024 / 1024

    return {
      cpu: Math.round(cpuPercent * 100) / 100,
      memory: Math.round(memoryMB * 100) / 100
    }
  }

  // Port interne par défaut pour chaque type de BDD
  private getInternalPort(type: string): number {
    const ports: Record<string, number> = {
      postgres: 5432,
      mysql: 3306,
      mongo: 27017,
      redis: 6379,
    }
    return ports[type]
  }

  // Crée un réseau Docker
  async createNetwork(name: string, driver: NetworkDriverEnum = 'bridge'): Promise<{ dockerId: string }> {
    const network = await this.docker.createNetwork({
      Name: `${ENV_NAME_INSTANCE}${name}`,
      Driver: driver,
    })
    return { dockerId: network.id }
  }

  // Supprime un réseau Docker
  async removeNetwork(dockerId: string): Promise<void> {
    await this.docker.getNetwork(dockerId).remove()
  }

  // Connecte un container à un réseau
  async connectContainer(dockerNetworkId: string, containerId: string): Promise<void> {
    await this.docker.getNetwork(dockerNetworkId).connect({ Container: containerId })
  }

  // Déconnecte un container d'un réseau
  async disconnectContainer(dockerNetworkId: string, containerId: string): Promise<void> {
    await this.docker.getNetwork(dockerNetworkId).disconnect({ Container: containerId })
  }

  // Crée un container d'outil d'administration et le connecte au réseau
  async createAdminTool(toolType: AdminToolType, name: string, hostPort: number, networkDockerId: string, env: string[] = []): Promise<string> {
    const { image, internalPort } = ADMIN_TOOL_CONFIG[toolType]

    const exists = await this.imageExists(image)
    if (!exists) {
      console.log(`Pull de l'image ${image}...`)
      await this.pullImage(image)
      console.log(`Image ${image} prête`)
    }

    const container = await this.docker.createContainer({
      Image: image,
      name: `${ENV_NAME_INSTANCE}${name.trim()}`,
      Env: env.length > 0 ? env : undefined,
      HostConfig: {
        PortBindings: {
          [`${internalPort}/tcp`]: [{ HostPort: hostPort.toString() }]
        },
        RestartPolicy: { Name: 'unless-stopped' }
      }
    })

    await this.connectContainer(networkDockerId, container.id)
    return container.id
  }
}