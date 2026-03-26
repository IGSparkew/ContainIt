export type InstanceType = 'postgres' | 'mysql' | 'mongo' | 'redis'
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
}