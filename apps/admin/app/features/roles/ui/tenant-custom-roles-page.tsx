import { Button } from '@repo/ui'
import { useQuery } from '@tanstack/react-query'
import { ArrowLeftIcon } from 'lucide-react'
import { Link, useNavigate, useSearchParams } from 'react-router'

import { TenantCustomRolesPanel } from '~/features/roles/ui/tenant-custom-roles-panel'
import { fetchAdminTenant } from '~/shared/api/admin-api'
import { isPlatformAdmin } from '~/shared/auth/admin-access'
import { useAdminPermissions } from '~/shared/hooks/use-admin-permissions'
import { adminQueryKeys } from '~/shared/lib/admin-query-keys'
import { resolveRbacAdminBackLink } from '~/shared/lib/rbac-admin-nav'
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

  const backLink = resolveRbacAdminBackLink(
    searchParams,
    canReadTenants
      ? { to: `/tenants/${tenantId}?tab=custom-roles`, label: '返回租户' }
      : { to: '/', label: '返回概览' },
  )

  return (
    <div className="space-y-6 admin-stagger">
      <Button
        variant="ghost"
        size="sm"
        className="-ml-2 w-fit"
        nativeButton={false}
        render={<Link to={backLink.to} />}
      >
        <ArrowLeftIcon className="size-3.5" />
        {backLink.label}
      </Button>

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
