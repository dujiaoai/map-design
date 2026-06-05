import { z } from 'zod'

export const SaaSRole = {
  PLATFORM_ADMIN: 'platform_admin',
  TENANT_ADMIN: 'tenant_admin',
  MEMBER: 'member',
  VIEWER: 'viewer',
} as const

export type SaaSRole = (typeof SaaSRole)[keyof typeof SaaSRole]

export const sessionUserSchema = z.object({
  id: z.string(),
  email: z.string().email(),
  name: z.string().optional(),
  roles: z.array(
    z.enum([SaaSRole.PLATFORM_ADMIN, SaaSRole.TENANT_ADMIN, SaaSRole.MEMBER, SaaSRole.VIEWER]),
  ),
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

export interface TokenPair {
  accessToken: string
  refreshToken?: string
  expiresAt?: number
}

export interface LoginCredentials {
  email: string
  password: string
  tenantId?: string
}

export type RedirectFn = (path: string) => Response

export interface StorageLike {
  getItem(key: string): string | null
  setItem(key: string, value: string): void
  removeItem(key: string): void
}
