import { authProfileFormSchema, authResetPasswordSchema } from '@repo/auth'
import type { z } from 'zod'

export const profileFormSchema = authProfileFormSchema()
export const resetPasswordSchema = authResetPasswordSchema({ minMessage: '新密码至少 8 位' })

export type ProfileFormValues = z.infer<typeof profileFormSchema>
export type ResetPasswordFormValues = z.infer<typeof resetPasswordSchema>
