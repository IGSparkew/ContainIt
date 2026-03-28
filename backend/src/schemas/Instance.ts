import z from "zod"

export const createInstanceSchema = z.object({
  name: z.string().min(1).max(32),
  type: z.enum(['postgres', 'mysql', 'mongo', 'redis']),
  port: z.number().int().min(1024).max(65535),
  password: z.string().min(6),
  version: z.string().optional(),
  volumeId: z.string().optional()
})

export const updateInstanceSchema = z.object({
  name: z.string().min(1).max(32).optional(),
  port: z.number().int().min(1024).max(65535).optional(),
  password: z.string().min(6).optional(),
  version: z.string().optional()
})

export const deleteInstanceSchema = z.object({
  keepVolume: z.boolean().default(false)
});

// Le type est inféré automatiquement depuis le schéma
export type CreateInstanceInput = z.infer<typeof createInstanceSchema>;
export type UpdateInstanceInput = z.infer<typeof updateInstanceSchema>;
export type DeleteInstanceSchema = z.infer<typeof deleteInstanceSchema>;


