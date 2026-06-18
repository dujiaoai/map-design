import type { LoginResponse } from '@repo/auth'

import { api } from './client'

export function completeTenantSamlAcs(slug: string, samlResponse: string, relayState?: string) {
  const normalized = slug.trim()
  if (!normalized) {
    return Promise.reject(new Error('Tenant slug is required'))
  }
  return api.post<LoginResponse>(
    `/auth/tenant-sso/saml/${encodeURIComponent(normalized)}/acs`,
    { samlResponse, relayState: relayState ?? null },
  )
}
