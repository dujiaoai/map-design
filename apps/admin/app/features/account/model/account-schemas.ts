import { authChangePasswordSchema } from '@repo/auth'
import { z } from 'zod'

export const profileFormSchema = z.object({
  name: z.string().trim().min(1, '显示名不能为空').max(128, '最多 128 个字符'),
})

export type ProfileFormValues = z.infer<typeof profileFormSchema>

export const resetPasswordSchema = authChangePasswordSchema({
  minMessage: '新密码至少 8 位',
})

export type ResetPasswordFormValues = z.infer<typeof resetPasswordSchema>
