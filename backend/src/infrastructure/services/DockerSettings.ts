import { AdminToolType } from "../../domain/models/instance.js"

/** Prefix applied to every container/volume/network name managed by ContainIt */
export const CONTAINIT_PREFIX = 'containit-'

/** Default port to start scanning from when searching for a free port */
export const DEFAULT_PORT_SCAN_START = 10000

/** Environment variable builders for each supported database type */
export const DB_ENV_VARS: Record<string, (password: string) => string[]> = {
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

/** Docker image name for each supported database type */
export const DB_IMAGE_NAMES: Record<string, string> = {
    postgres: 'postgres',
    mysql:    'mysql',
    mongo:    'mongo',
    redis:    'redis',
}

/** Internal container port for each supported database type */
export const DB_INTERNAL_PORTS: Record<string, number> = {
    postgres: 5432,
    mysql:    3306,
    mongo:    27017,
    redis:    6379,
}

/** Volume mount path inside the container for each database type */
export const DB_DATA_PATHS: Record<string, string> = {
    postgres: '/var/lib/postgresql',
    mysql:    '/var/lib/mysql',
    mongo:    '/data/db',
    redis:    '/data',
}

/** Admin tool image and internal port for each supported tool type */
export const ADMIN_TOOL_CONFIG: Record<AdminToolType, { image: string; internalPort: number }> = {
    'adminer':       { image: 'adminer',            internalPort: 8080 },
    'mongo-express': { image: 'mongo-express',      internalPort: 8081 },
    'redisinsight':  { image: 'redis/redisinsight',  internalPort: 5540 },
}