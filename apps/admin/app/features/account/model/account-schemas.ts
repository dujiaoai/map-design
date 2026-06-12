import { z } from 'zod'

export const profileFormSchema = z.object({
  name: z.string().trim().min(1, '显示名不能为空').max(128, '最多 128 个字符'),
})

export type ProfileFormValues = z.infer<typeof profileFormSchema>

export const resetPasswordSchema = z
  .object({
    oldPassword: z.string().min(1, '旧密码不能为空'),
    newPassword: z.string().min(8, '新密码至少 8 位').max(128, '最多 128 个字符'),
    confirmPassword: z.string().min(1, '确认密码不能为空'),
  })
  .refine((data) => data.newPassword === data.confirmPassword, {
    message: '两次输入的密码不一致',
    path: ['confirmPassword'],
  })

export type ResetPasswordFormValues = z.infer<typeof resetPasswordSchema>
