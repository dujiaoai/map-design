import { useQuery } from '@tanstack/react-query'
import { useMemo } from 'react'

import { fetchAdminTenant } from '~/shared/api/admin-api'
import { adminQueryKeys } from '~/shared/lib/admin-query-keys'

import { formatAdminShellTitle } from './format-admin-shell-title'
import { resolveAdminPageTitle } from './resolve-admin-page-title'

const TENANT_DETAIL_PATH = /^\/tenants\/([^/]+)$/

export function useAdminShellTitle(pathname: string) {
  const tenantMatch = pathname.match(TENANT_DETAIL_PATH)
  const tenantId = tenantMatch?.[1]

  const tenantQuery = useQuery({
    queryKey: adminQueryKeys.tenant(tenantId ?? ''),
    queryFn: () => fetchAdminTenant(tenantId!),
    enabled: Boolean(tenantId),
    staleTime: 60_000,
  })

  return useMemo(() => {
    const baseTitle = resolveAdminPageTitle(pathname)
    if (!tenantId) return baseTitle
    return formatAdminShellTitle(baseTitle, tenantQuery.data?.name)
  }, [pathname, tenantId, tenantQuery.data?.name])
}
