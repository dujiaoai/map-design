import { Button } from '@repo/ui'
import { useQuery } from '@tanstack/react-query'
import { Link } from 'react-router'

import { fetchAdminTenant } from '~/shared/api/admin-api'
import { useAdminPermissions } from '~/shared/hooks/use-admin-permissions'
import { adminQueryKeys } from '~/shared/lib/admin-query-keys'
import { AdminIdCell } from '~/shared/ui/admin-id-cell'
import { AdminPanel } from '~/shared/ui/admin-page-shell'

export function BillingFilterSeedBanner({
  tenantId,
  userId,
  onClear,
}: {
  tenantId?: string
  userId?: string
  onClear: () => void
}) {
  const { can } = useAdminPermissions()
  const canReadTenants = can('admin:tenants:read')

  const tenantQuery = useQuery({
    queryKey: adminQueryKeys.tenant(tenantId ?? ''),
    queryFn: () => fetchAdminTenant(tenantId!),
    enabled: Boolean(tenantId),
    staleTime: 60_000,
  })

  if (!tenantId && !userId) return null

  return (
    <AdminPanel className="flex flex-wrap items-center justify-between gap-3 border-primary/20 bg-primary/5 px-4 py-3 md:px-5">
      <div className="flex flex-wrap items-center gap-x-4 gap-y-2 text-sm">
        <span className="admin-display text-xs tracking-[0.16em] text-primary/80 uppercase">
          URL 筛选
        </span>
        {tenantId ? (
          <span className="flex flex-wrap items-center gap-2">
            <span className="text-muted-foreground">租户</span>
            {tenantQuery.data ? (
              <span className="font-medium">{tenantQuery.data.name}</span>
            ) : null}
            <AdminIdCell value={tenantId} label="租户" />
            {canReadTenants ? (
              <Link
                to={`/tenants/${tenantId}?tab=info`}
                className="text-xs text-primary underline-offset-4 hover:underline"
              >
                租户详情
              </Link>
            ) : null}
          </span>
        ) : null}
        {userId ? (
          <span className="flex flex-wrap items-center gap-2">
            <span className="text-muted-foreground">用户</span>
            <AdminIdCell value={userId} label="用户" />
            {canReadTenants && tenantId ? (
              <Link
                to={`/users?tenantId=${encodeURIComponent(tenantId)}`}
                className="text-xs text-primary underline-offset-4 hover:underline"
              >
                用户列表
              </Link>
            ) : null}
          </span>
        ) : null}
      </div>
      <Button type="button" variant="ghost" size="sm" onClick={onClear}>
        清除筛选
      </Button>
    </AdminPanel>
  )
}
