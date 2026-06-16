import type { OidcAuthorizeResponse } from '@repo/auth'

import { api } from './client'

export interface OidcProvidersResponse {
  enabled: boolean
  authorizationCodeFlowAvailable: boolean
  providers: Array<{ id: string; displayName: string }>
}

export function fetchOidcProviders() {
  return api.get<OidcProvidersResponse>('/auth/oidc/providers')
}

export function startOidcAuthorize(providerId: string, tenantId: string) {
  const params = new URLSearchParams({ client: 'web', tenantId: tenantId.trim() })
  return api.get<OidcAuthorizeResponse>(
    `/auth/oidc/${encodeURIComponent(providerId)}/authorize?${params.toString()}`,
  )
}
