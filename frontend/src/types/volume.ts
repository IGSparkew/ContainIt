import type { InstanceType } from "./instance"

export interface Volume {
    id: string,
    containerId: string,
    name: string,
    type: InstanceType,
    orphan: boolean
}