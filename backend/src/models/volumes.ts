import { InstanceType } from "./instance.js"

export interface Volume {
    id: string,
    containerId: string,
    name: string,
    type: InstanceType,
    createdAt: string,
    orphan: boolean
}
