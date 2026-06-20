import type { TenantDetailTab } from '~/features/tenants/lib/tenant-detail-nav'
import type { AdminPageBackLink } from '~/shared/ui/admin-page-shell'

import { parseRbacAdminNavFrom, resolveRbacAdminBackLink } from './rbac-admin-nav'

/** 租户作用域页：有 ?tenantId= 或 RBAC from 时显示返回，侧栏直达时不显示。 */
export function resolveTenantScopedAdminBackLink(
  searchParams: URLSearchParams,
  options: {
    tenantTab: TenantDetailTab
    canReadTenants: boolean
  },
): AdminPageBackLink | null {
  if (parseRbacAdminNavFrom(searchParams.get('from'))) {
    return resolveRbacAdminBackLink(searchParams)
  }

  const tenantId = searchParams.get('tenantId')
  if (tenantId && options.canReadTenants) {
    return {
      to: `/tenants/${tenantId}?tab=${options.tenantTab}`,
      label: '返回租户',
    }
  }

  return null
}
