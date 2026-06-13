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
