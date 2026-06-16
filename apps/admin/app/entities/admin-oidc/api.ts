import { api } from '~/shared/api/client'

import type { OidcAuthorizeResponse, OidcProvidersResponse } from './model'

export function fetchOidcProviders() {
  return api.get<OidcProvidersResponse>('/auth/oidc/providers')
}

export function startOidcAuthorize(providerId: string, tenantId: string) {
  const params = new URLSearchParams({ client: 'admin', tenantId: tenantId.trim() })
  return api.get<OidcAuthorizeResponse>(
    `/auth/oidc/${encodeURIComponent(providerId)}/authorize?${params.toString()}`,
  )
}
