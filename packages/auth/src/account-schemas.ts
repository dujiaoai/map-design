import { z } from 'zod'

import { authChangePasswordSchema } from './password-policy'

/** 对齐 `PUT /v1/users/me` 的 `name` 字段 */
export function authProfileFormSchema(options?: {
  emptyMessage?: string
  maxMessage?: string
  phoneMaxMessage?: string
  avatarUrlMaxMessage?: string
}) {
  return z.object({
    name: z
      .string()
      .trim()
      .min(1, options?.emptyMessage ?? '显示名不能为空')
      .max(128, options?.maxMessage ?? '最多 128 个字符'),
    phone: z
      .string()
      .trim()
      .max(32, options?.phoneMaxMessage ?? '手机号最多 32 个字符')
      .optional()
      .or(z.literal('')),
    avatarUrl: z
      .string()
      .trim()
      .max(512, options?.avatarUrlMaxMessage ?? '头像 URL 最多 512 个字符')
      .optional()
      .or(z.literal('')),
  })
}

/** 对齐 `POST /v1/users/me/password` */
export function authResetPasswordSchema(options?: { minMessage?: string }) {
  return authChangePasswordSchema({
    minMessage: options?.minMessage ?? '新密码至少 8 位',
  })
}
