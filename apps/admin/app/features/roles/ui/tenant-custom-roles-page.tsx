import { useQuery } from '@tanstack/react-query'
import { useNavigate, useSearchParams } from 'react-router'

import { TenantCustomRolesPanel } from '~/features/roles/ui/tenant-custom-roles-panel'
import { fetchAdminTenant } from '~/shared/api/admin-api'
import { isPlatformAdmin } from '~/shared/auth/admin-access'
import { useAdminPermissions } from '~/shared/hooks/use-admin-permissions'
import { adminQueryKeys } from '~/shared/lib/admin-query-keys'
import { resolveTenantScopedAdminBackLink } from '~/shared/lib/tenant-scoped-admin-nav'
import { AdminPageBackButton } from '~/shared/ui/admin-page-shell'
import { AdminTenantContextBanner } from '~/shared/ui/admin-tenant-context-banner'

export function TenantCustomRolesPage({ tenantId }: { tenantId: string }) {
  const { session, can } = useAdminPermissions()
  const canReadTenants = can('admin:tenants:read')
  const navigate = useNavigate()
  const [searchParams] = useSearchParams()
  const showTenantClear = isPlatformAdmin(session) && Boolean(searchParams.get('tenantId'))

  const tenantQuery = useQuery({
    queryKey: adminQueryKeys.tenant(tenantId),
    queryFn: () => fetchAdminTenant(tenantId),
    staleTime: 60_000,
  })

  const resolvedTenantName =
    tenantQuery.data?.name ?? session?.tenant?.name ?? '当前租户'
  const tenantContextLabel = tenantQuery.data
    ? `${tenantQuery.data.name} (${tenantQuery.data.slug})`
    : resolvedTenantName

  const backLink = resolveTenantScopedAdminBackLink(searchParams, {
    tenantTab: 'custom-roles',
    canReadTenants,
  })

  return (
    <div className="space-y-6 admin-stagger">
      <AdminPageBackButton backLink={backLink} />

      {showTenantClear ? (
        <AdminTenantContextBanner
          tenantId={tenantId}
          tenantLabel={tenantContextLabel}
          showMembersLink
          onClear={() => void navigate('/tenant-roles')}
        />
      ) : null}

      <TenantCustomRolesPanel
        tenantId={tenantId}
        tenantLabel={tenantContextLabel}
        initialRoleId={searchParams.get('roleId') ?? undefined}
      />
    </div>
  )
}
