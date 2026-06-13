import { useSession } from '@repo/auth'
import { useMemo } from 'react'

import { DEFAULT_TENANT_FEATURES } from '~/entities/navigation'
import { useTenantFeaturesQuery } from '~/shared/queries/tenant-queries'
import { usesSaasSessionBootstrap } from '~/shared/session/fetch-saas-session'

/** 侧栏 map-module 租户能力门控（C-09）；mock 会话用 DEFAULT_TENANT_FEATURES */
export function useEnabledTenantFeatures(): ReadonlySet<string> {
  const saasBootstrap = usesSaasSessionBootstrap()
  const session = useSession()
  const tenantId = session?.tenant?.id
  const featuresQuery = useTenantFeaturesQuery(tenantId, saasBootstrap)

  return useMemo(() => {
    if (!saasBootstrap) {
      return new Set(DEFAULT_TENANT_FEATURES)
    }
    if (featuresQuery.data?.features) {
      return new Set(featuresQuery.data.features)
    }
    return new Set(DEFAULT_TENANT_FEATURES)
  }, [saasBootstrap, featuresQuery.data?.features])
}
