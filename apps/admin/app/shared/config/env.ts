import { z } from 'zod'

const apiUrlSchema = z.union([z.string().url(), z.string().regex(/^\//)]).optional()

const envSchema = z.object({
  VITE_API_URL: apiUrlSchema,
})

export const env = envSchema.parse(import.meta.env)
