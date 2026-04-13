export const ADMIN_TYPES = ['adminer', 'mongo-express', 'redisinsight'] as const

export type DbInstanceType = 'postgres' | 'mysql' | 'mongo' | 'redis'
export type AdminToolType  = typeof ADMIN_TYPES[number]
export type InstanceType   = DbInstanceType | AdminToolType
export type InstanceStatus = 'running' | 'stopped' | 'error'

export function isAdminType(type: InstanceType): type is AdminToolType {
  return (ADMIN_TYPES as readonly string[]).includes(type)
}

export interface Instance {
  id: string
  name: string
  type: InstanceType
  port: number
  password: string
  status: InstanceStatus
  networkId?: string
}

export interface InstanceForm {
  name: string | undefined,
  type: InstanceType | undefined,
  port: number | undefined,
  password: string | undefined,
  volumeId: string | undefined,
  networkId: string | undefined
}
