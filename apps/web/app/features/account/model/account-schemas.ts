import { authChangePasswordSchema } from '@repo/auth'
import { z } from 'zod'

/** 对齐 `PUT /v1/users/me` 的 `name` 字段 */
export const profileFormSchema = z.object({
  name: z.string().trim().min(1, '显示名不能为空').max(128, '最多 128 个字符'),
})

export type ProfileFormValues = z.infer<typeof profileFormSchema>

/** 对齐 `POST /v1/users/me/password`（新密码至少 8 位，且不同于旧密码） */
export const resetPasswordSchema = authChangePasswordSchema({
  minMessage: '新密码至少 8 位',
})

export type ResetPasswordFormValues = z.infer<typeof resetPasswordSchema>
