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
