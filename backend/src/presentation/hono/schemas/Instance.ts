import z from "zod"

const ADMIN_TYPES = ['adminer', 'mongo-express', 'redisinsight'] as const

export const createInstanceSchema = z.object({
  name: z.string().trim().min(1).max(32),
  type: z.enum(['postgres', 'mysql', 'mongo', 'redis', 'adminer', 'mongo-express', 'redisinsight']),
  port: z.number().int().min(1024).max(65535).optional(),
  password: z.string().min(6).optional(),
  version: z.string().optional(),
  volumeId: z.string().optional(),
  networkId: z.string().optional(),
}).superRefine((data, ctx) => {
  const isAdmin = (ADMIN_TYPES as readonly string[]).includes(data.type)
  if (isAdmin) {
    if (!data.networkId) {
      ctx.addIssue({ code: 'custom', path: ['networkId'], message: 'networkId is required for admin tools' })
    }
  } else {
    if (data.port === undefined) {
      ctx.addIssue({ code: 'custom', path: ['port'], message: 'port is required for DB instances' })
    }
    if (!data.password) {
      ctx.addIssue({ code: 'custom', path: ['password'], message: 'password is required for DB instances' })
    }
  }
})

export const updateInstanceSchema = z.object({
  name: z.string().trim().min(1).max(32).optional(),
  port: z.number().int().min(1024).max(65535).optional(),
  password: z.string().min(6).optional(),
  version: z.string().optional()
})

export const deleteInstanceSchema = z.object({
  keepVolume: z.boolean()
})

export type CreateInstanceInput = z.infer<typeof createInstanceSchema>;
export type UpdateInstanceInput = z.infer<typeof updateInstanceSchema>;
export type DeleteInstanceInput = z.infer<typeof deleteInstanceSchema>;