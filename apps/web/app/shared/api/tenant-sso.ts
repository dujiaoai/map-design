import type { OidcAuthorizeResponse, LoginResponse } from '@repo/auth'

import { api } from './client'

export interface TenantSsoPublicResponse {
  tenantSlug: string
  enabled: boolean
  displayName: string | null
  loginAvailable: boolean
}

export function fetchTenantSsoBySlug(slug: string) {
  const normalized = slug.trim()
  if (!normalized) {
    return Promise.reject(new Error('Tenant slug is required'))
  }
  return api.get<TenantSsoPublicResponse>(`/auth/tenants/${encodeURIComponent(normalized)}/sso`)
}

export function startTenantSsoAuthorize(slug: string) {
  const normalized = slug.trim()
  if (!normalized) {
    return Promise.reject(new Error('Tenant slug is required'))
  }
  return api.get<OidcAuthorizeResponse>(
    `/auth/tenants/${encodeURIComponent(normalized)}/sso/authorize`,
  )
}

export function completeTenantSsoCallback(slug: string, code: string, state: string) {
  const normalized = slug.trim()
  if (!normalized) {
    return Promise.reject(new Error('Tenant slug is required'))
  }
  return api.post<LoginResponse>(`/auth/tenants/${encodeURIComponent(normalized)}/sso/callback`, {
    code,
    state,
  })
}
