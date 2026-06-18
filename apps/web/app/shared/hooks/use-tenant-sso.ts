import { useQuery } from '@tanstack/react-query'

import { fetchTenantSsoBySlug } from '~/shared/api/tenant-sso'
import { isSaasAuthEnabled } from '~/shared/config/saas-auth-enabled'

export function tenantSsoQueryKey(slug: string) {
  return ['auth', 'tenant-sso', slug] as const
}

export function useTenantSsoQuery(tenantSlug: string | undefined) {
  const slug = tenantSlug?.trim() ?? ''
  return useQuery({
    queryKey: tenantSsoQueryKey(slug),
    queryFn: () => fetchTenantSsoBySlug(slug),
    enabled: isSaasAuthEnabled() && slug.length >= 2,
    staleTime: 60_000,
    retry: false,
  })
}

export function isTenantSsoLoginVisible(
  sso: Awaited<ReturnType<typeof fetchTenantSsoBySlug>> | undefined,
): boolean {
  return Boolean(sso?.enabled && sso.loginAvailable && sso.displayName)
}
