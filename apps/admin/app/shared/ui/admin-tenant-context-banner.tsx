import { Button } from '@repo/ui'
import { Link } from 'react-router'

import { useAdminPermissions } from '~/shared/hooks/use-admin-permissions'
import { AdminPanel } from '~/shared/ui/admin-page-shell'

const BILLING_PERMISSIONS = [
  'admin:billing:read',
  'admin:billing:adjust',
  'admin:billing:packages:write',
  'admin:billing:refund',
] as const

export function AdminTenantContextBanner({
  tenantId,
  tenantLabel,
  onClear,
  showMembersLink = true,
  showUsersLink = false,
}: {
  tenantId: string
  tenantLabel: string
  onClear?: () => void
  showMembersLink?: boolean
  showUsersLink?: boolean
}) {
  const { can, canAny } = useAdminPermissions()
  const canReadTenants = can('admin:tenants:read')
  const canReadUsers = can('admin:users:read')
  const canViewBilling = canAny([...BILLING_PERMISSIONS])

  return (
    <AdminPanel className="flex flex-wrap items-center justify-between gap-3 border-primary/20 bg-primary/5 px-4 py-3 md:px-5">
      <p className="text-sm">
        <span className="text-muted-foreground">租户上下文 · </span>
        <span className="font-medium">{tenantLabel}</span>
      </p>
      <div className="flex flex-wrap gap-2">
        {canReadTenants ? (
          <Button
            nativeButton={false}
            variant="outline"
            size="sm"
            render={<Link to={`/tenants/${tenantId}?tab=info`} />}
          >
            租户详情
          </Button>
        ) : null}
        {showMembersLink && canReadTenants ? (
          <Button
            nativeButton={false}
            variant="outline"
            size="sm"
            render={<Link to={`/tenants/${tenantId}?tab=members`} />}
          >
            成员管理
          </Button>
        ) : null}
        {showUsersLink && canReadUsers ? (
          <Button
            nativeButton={false}
            variant="outline"
            size="sm"
            render={<Link to={`/users?tenantId=${encodeURIComponent(tenantId)}`} />}
          >
            用户列表
          </Button>
        ) : null}
        {canViewBilling ? (
          <Button
            nativeButton={false}
            variant="outline"
            size="sm"
            render={
              <Link to={`/billing?tab=wallets&tenantId=${encodeURIComponent(tenantId)}`} />
            }
          >
            计费钱包
          </Button>
        ) : null}
        {onClear ? (
          <Button type="button" variant="ghost" size="sm" onClick={onClear}>
            清除筛选
          </Button>
        ) : null}
      </div>
    </AdminPanel>
  )
}
