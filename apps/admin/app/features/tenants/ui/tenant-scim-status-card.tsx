import { Badge } from '@repo/ui'
import { UsersIcon } from 'lucide-react'

import type { AdminTenantScimProvisioning } from '~/entities/tenant/model'
import { AdminConfigRow, AdminPanel, AdminPanelHeader } from '~/shared/ui/admin-page-shell'

export function TenantScimStatusCard({ status }: { status: AdminTenantScimProvisioning }) {
  return (
    <AdminPanel>
      <AdminPanelHeader
        icon={UsersIcon}
        title="SCIM Directory Sync"
        description="目录同步 PoC 状态（只读）"
      />
      <AdminConfigRow
        label="Provisioning"
        value={
          <Badge variant={status.enabled ? 'default' : 'secondary'}>
            {status.enabled ? '已启用' : '未启用'}
          </Badge>
        }
      />
      <AdminConfigRow
        label="Bearer Token"
        value={status.tokenConfigured ? '已配置' : '未配置'}
      />
      <AdminConfigRow label="Users Endpoint" value={status.usersEndpointUrl} mono />
    </AdminPanel>
  )
}
