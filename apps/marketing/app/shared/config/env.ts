import { z } from 'zod'

const envSchema = z.object({
  VITE_WEB_APP_URL: z.string().url().optional(),
})

export const env = envSchema.parse(import.meta.env)
