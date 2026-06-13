import { z } from 'zod'

/** 对齐后端 `@Size(min = 8)`（Register / ChangePassword / Admin 邀请） */
export const AUTH_PASSWORD_MIN_LENGTH = 8

export const AUTH_PASSWORD_MAX_LENGTH = 128

const defaultMinMessage = `密码至少 ${AUTH_PASSWORD_MIN_LENGTH} 位`
const defaultMaxMessage = `最多 ${AUTH_PASSWORD_MAX_LENGTH} 个字符`

/** 单字段密码（注册、邀请初始密码、新密码） */
export function authPasswordFieldSchema(
  minMessage: string = defaultMinMessage,
  maxMessage: string = defaultMaxMessage,
) {
  return z
    .string()
    .min(AUTH_PASSWORD_MIN_LENGTH, minMessage)
    .max(AUTH_PASSWORD_MAX_LENGTH, maxMessage)
}

const defaultMismatchMessage = '两次输入的密码不一致'
const defaultSameAsOldMessage = '新密码不能与当前密码相同'

/** 改密表单（旧密码 + 新密码 + 确认），对齐 POST /v1/users/me/password */
export function authChangePasswordSchema(options?: {
  minMessage?: string
  mismatchMessage?: string
  sameAsOldMessage?: string
}) {
  const minMessage = options?.minMessage ?? defaultMinMessage
  const mismatchMessage = options?.mismatchMessage ?? defaultMismatchMessage
  const sameAsOldMessage = options?.sameAsOldMessage ?? defaultSameAsOldMessage

  return z
    .object({
      oldPassword: z.string().min(1, '旧密码不能为空'),
      newPassword: authPasswordFieldSchema(minMessage),
      confirmPassword: z.string().min(1, '确认密码不能为空'),
    })
    .refine((data) => data.newPassword === data.confirmPassword, {
      message: mismatchMessage,
      path: ['confirmPassword'],
    })
    .refine((data) => data.newPassword !== data.oldPassword, {
      message: sameAsOldMessage,
      path: ['newPassword'],
    })
}
