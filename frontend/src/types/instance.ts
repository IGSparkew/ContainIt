export type InstanceType = 'postgres' | 'mysql' | 'mongo' | 'redis'
export type InstanceStatus = 'running' | 'stopped' | 'error'

export interface Instance {
  id: string
  name: string
  type: InstanceType
  port: number
  password: string
  status: InstanceStatus
}

export interface InstanceForm {
  name: string | undefined,
  type: InstanceType | undefined,
  port: number | undefined,
  password: string | undefined
}