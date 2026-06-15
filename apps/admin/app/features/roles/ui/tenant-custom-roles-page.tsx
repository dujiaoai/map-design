import { useAdminPermissions } from '~/shared/hooks/use-admin-permissions'
import { AdminPageHeader } from '~/shared/ui/admin-page-shell'

import { TenantCustomRolesPanel } from './tenant-custom-roles-panel'

export function TenantCustomRolesPage({ tenantId }: { tenantId: string }) {
  const { session } = useAdminPermissions()
  const resolvedTenantName = session?.tenant?.name ?? '当前租户'

  return (
    <div className="space-y-6">
      <AdminPageHeader
        eyebrow="RBAC"
        title="自定义角色"
        description={`${resolvedTenantName} · 创建本租户角色并配置 tenant / workspace 权限。`}
      />
      <TenantCustomRolesPanel tenantId={tenantId} />
    </div>
  )
}
