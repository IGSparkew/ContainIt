export type NetworkDriverEnum = 'bridge' | 'overlay';

export interface Network {
    id: string
    name: string
    driver: NetworkDriverEnum
    dockerId: string
    instance: string[]
    createdAt: string
}

export interface NetworkForm {
    name: string | undefined
    driver: NetworkDriverEnum | undefined
}