import z from "zod"

export const createNetworkSchema = z.object({
    name: z.string().min(2).max(32).regex(/^[a-zA-Z0-9-_]+$/, "Uniquement lettres, chiffres, tirets et underscores"),
    driver: z.enum(['bridge', 'overlay']).default('bridge')
})

export const attachContainerSchema = z.object({
    containerId: z.string().nonempty()
})

export type CreateNetworkInput = z.infer<typeof createNetworkSchema>
export type AttachContainerInput = z.infer<typeof attachContainerSchema>
