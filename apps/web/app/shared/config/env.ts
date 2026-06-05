import { z } from 'zod'

const apiUrlSchema = z.union([z.string().url(), z.string().regex(/^\//)]).optional()

const envSchema = z.object({
  VITE_API_URL: apiUrlSchema,
  VITE_APP_URL: z.string().url().optional(),
})

/** 启动时校验 VITE_* 环境变量（扩展字段时在 schema 中追加） */
export const env = envSchema.parse(import.meta.env)
