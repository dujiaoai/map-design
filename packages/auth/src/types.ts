import { z } from 'zod'

/** 与 DB sys_role.code / JWT claims / SaaS API 响应一致（大写） */
export const SaaSRole = {
  PLATFORM_ADMIN: 'PLATFORM_ADMIN',
  TENANT_ADMIN: 'TENANT_ADMIN',
  MEMBER: 'MEMBER',
  VIEWER: 'VIEWER',
} as const

export type SaaSRole = (typeof SaaSRole)[keyof typeof SaaSRole]

export const sessionUserSchema = z.object({
  id: z.string(),
  email: z.string().email(),
  name: z.string().nullish(),
  phone: z.string().nullish(),
  avatarUrl: z.string().nullish(),
  roles: z.array(
    z.enum([SaaSRole.PLATFORM_ADMIN, SaaSRole.TENANT_ADMIN, SaaSRole.MEMBER, SaaSRole.VIEWER]),
  ),
  /** Sprint D-02+：角色并集的有效权限码 */
  permissions: z.array(z.string()).optional(),
})

export const sessionTenantSchema = z.object({
  id: z.string(),
  name: z.string(),
  slug: z.string().optional(),
})

export const sessionSchema = z.object({
  user: sessionUserSchema,
  tenant: sessionTenantSchema.nullable(),
  expiresAt: z.number().optional(),
})

export type SessionUser = z.infer<typeof sessionUserSchema>
export type SessionTenant = z.infer<typeof sessionTenantSchema>
export type Session = z.infer<typeof sessionSchema>

export const loginUserSchema = sessionUserSchema.extend({
  tenant: sessionTenantSchema,
})

export const loginResponseSchema = z.object({
  accessToken: z.string(),
  refreshToken: z.string(),
  expiresIn: z.number(),
  user: loginUserSchema,
})

export const authTokensSchema = z.object({
  accessToken: z.string(),
  refreshToken: z.string(),
  expiresIn: z.number(),
})

export type LoginResponse = z.infer<typeof loginResponseSchema>
export type AuthTokensResponse = z.infer<typeof authTokensSchema>

export interface TokenPair {
  accessToken: string
  refreshToken?: string
  /** 服务端返回的 access token 有效秒数 */
  expiresIn?: number
  /** 本地计算的过期时间戳（毫秒） */
  expiresAt?: number
}

export interface LoginCredentials {
  email: string
  password: string
  tenantId?: string
}

export interface RegisterCredentials {
  email: string
  password: string
  tenantId: string
  displayName?: string
}

export interface RegisterOrgCredentials {
  orgName: string
  slug?: string
  email: string
  password: string
  displayName?: string
}

export interface RegisterOrgResponse {
  tenantSlug: string
  orgName: string
}

export type RedirectFn = (path: string) => Response

export interface StorageLike {
  getItem(key: string): string | null
  setItem(key: string, value: string): void
  removeItem(key: string): void
}
