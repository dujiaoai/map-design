import { z } from 'zod'

/** 对齐后端 EmailNormalizer：trim + lowercase */
export const authEmailFieldSchema = z
  .string()
  .trim()
  .min(1, '请输入邮箱')
  .email('请输入有效邮箱')
  .transform((value) => value.toLowerCase())

export const authTenantIdFieldSchema = z.string().trim().min(1, '请输入租户标识')
