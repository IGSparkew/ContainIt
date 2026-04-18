import z from "zod";

export const httpRequestIdSchema = z.object({
    id: z.string()
})

export type HttpRequestId = z.infer<typeof httpRequestIdSchema>;