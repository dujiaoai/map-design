import { Badge } from '@repo/ui'

import type { AdminTenantSamlConfig } from '~/entities/tenant/model'
import { AdminConfigRow, AdminPanel, AdminPanelHeader } from '~/shared/ui/admin-page-shell'
import { ShieldIcon } from 'lucide-react'

export function TenantSamlConfigCard({ config }: { config: AdminTenantSamlConfig }) {
  return (
    <AdminPanel>
      <AdminPanelHeader
        icon={ShieldIcon}
        title="租户 SAML / SSO"
        description="SAML 2.0 连接摘要（Phase 10 调研；只读）"
      />
      <AdminConfigRow
        label="状态"
        value={
          <Badge variant={config.enabled ? 'default' : 'secondary'}>
            {config.enabled ? '已启用' : '未启用'}
          </Badge>
        }
      />
      <AdminConfigRow label="Entity ID" value={config.entityId ?? '—'} mono />
      <AdminConfigRow label="SSO URL" value={config.ssoUrl ?? '—'} mono />
      <AdminConfigRow
        label="IdP 证书"
        value={config.certificateConfigured ? '已配置' : '未配置'}
      />
    </AdminPanel>
  )
}
