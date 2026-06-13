import { z } from 'zod'

import { authChangePasswordSchema } from './password-policy'

/** 对齐 `PUT /v1/users/me` 的 `name` 字段 */
export function authProfileFormSchema(options?: {
  emptyMessage?: string
  maxMessage?: string
}) {
  return z.object({
    name: z
      .string()
      .trim()
      .min(1, options?.emptyMessage ?? '显示名不能为空')
      .max(128, options?.maxMessage ?? '最多 128 个字符'),
  })
}

/** 对齐 `POST /v1/users/me/password` */
export function authResetPasswordSchema(options?: { minMessage?: string }) {
  return authChangePasswordSchema({
    minMessage: options?.minMessage ?? '新密码至少 8 位',
  })
}
