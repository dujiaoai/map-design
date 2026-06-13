import { z } from 'zod'

/** 对齐后端 `@Size(min = 8)`（Register / ChangePassword / Admin 邀请） */
export const AUTH_PASSWORD_MIN_LENGTH = 8

export const AUTH_PASSWORD_MAX_LENGTH = 128

/** 大小写 + 数字（与后端 PasswordPolicyService 一致） */
export const AUTH_PASSWORD_STRENGTH_REGEX = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d).+$/

const defaultStrengthMessage = '密码须至少 8 位且包含大小写字母与数字'

export function isAuthPasswordStrengthRequired(): boolean {
  if (typeof import.meta !== 'undefined' && import.meta.env?.VITE_AUTH_PASSWORD_STRENGTH === 'true') {
    return true
  }
  return false
}

const defaultMinMessage = `密码至少 ${AUTH_PASSWORD_MIN_LENGTH} 位`
const defaultMaxMessage = `最多 ${AUTH_PASSWORD_MAX_LENGTH} 个字符`

/** 单字段密码（注册、邀请初始密码、新密码） */
export function authPasswordFieldSchema(options?: {
  minMessage?: string
  maxMessage?: string
  requireStrength?: boolean
  strengthMessage?: string
}) {
  const requireStrength = options?.requireStrength ?? isAuthPasswordStrengthRequired()
  let schema = z
    .string()
    .min(AUTH_PASSWORD_MIN_LENGTH, options?.minMessage ?? defaultMinMessage)
    .max(AUTH_PASSWORD_MAX_LENGTH, options?.maxMessage ?? defaultMaxMessage)

  if (requireStrength) {
    schema = schema.regex(
      AUTH_PASSWORD_STRENGTH_REGEX,
      options?.strengthMessage ?? defaultStrengthMessage,
    )
  }

  return schema
}

const defaultMismatchMessage = '两次输入的密码不一致'
const defaultSameAsOldMessage = '新密码不能与当前密码相同'

/** 改密表单（旧密码 + 新密码 + 确认），对齐 POST /v1/users/me/password */
export function authChangePasswordSchema(options?: {
  minMessage?: string
  mismatchMessage?: string
  sameAsOldMessage?: string
  requireStrength?: boolean
  strengthMessage?: string
}) {
  const minMessage = options?.minMessage ?? defaultMinMessage
  const mismatchMessage = options?.mismatchMessage ?? defaultMismatchMessage
  const sameAsOldMessage = options?.sameAsOldMessage ?? defaultSameAsOldMessage

  return z
    .object({
      oldPassword: z.string().min(1, '旧密码不能为空'),
      newPassword: authPasswordFieldSchema({
        minMessage,
        requireStrength: options?.requireStrength,
        strengthMessage: options?.strengthMessage,
      }),
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
