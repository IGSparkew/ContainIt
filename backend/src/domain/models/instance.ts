export const DB_TYPES    = ['postgres', 'mysql', 'mongo', 'redis'] as const
export const ADMIN_TYPES = ['adminer', 'mongo-express', 'redisinsight'] as const

export type DbInstanceType = typeof DB_TYPES[number]
export type AdminToolType  = typeof ADMIN_TYPES[number]
export type InstanceType   = DbInstanceType | AdminToolType

export function isAdminType(type: InstanceType): type is AdminToolType {
  return (ADMIN_TYPES as readonly string[]).includes(type)
}

export type InstanceStatus = 'running' | 'stopped' | 'error'

export interface Instance {
  id: string
  name: string
  type: InstanceType
  image: string
  port: number
  password: string
  containerId: string
  status: InstanceStatus
  createdAt: string
  networkId?: string
}

export type CreateInstanceResult = {
  containerId: string,
  volumeName: string
}

export const SUPPORTED_DB_IMAGES = ['postgres', 'mysql', 'mongo', 'redis'] as const;

export const ADMIN_TOOL_IMAGES: Record<AdminToolType, string> = {
    'adminer':       'adminer',
    'mongo-express': 'mongo-express',
    'redisinsight':  'redis/redisinsight',
};