import { useQuery } from '@tanstack/react-query'
import { HeartPulseIcon } from 'lucide-react'

import { fetchAdminAuditWebhookSelfHealStatus } from '~/shared/api/admin-api'
import { adminQueryKeys } from '~/shared/lib/admin-query-keys'
import { AdminConfigRow, AdminMetricCard, AdminPanel, AdminPanelHeader } from '~/shared/ui/admin-page-shell'

export function AuditWebhookSelfHealPanel() {
  const query = useQuery({
    queryKey: adminQueryKeys.auditWebhookSelfHeal,
    queryFn: fetchAdminAuditWebhookSelfHealStatus,
  })
  const status = query.data

  return (
    <AdminPanel>
      <AdminPanelHeader
        icon={HeartPulseIcon}
        title="Webhook SLA 自愈"
        description="降级目标冷却后可自动恢复（Phase 15-3）"
      />
      <div className="grid gap-3 sm:grid-cols-2">
        <AdminMetricCard label="降级目标" value={status ? String(status.degradedTargetCount) : '—'} />
        <AdminMetricCard
          label="可自愈"
          value={status ? String(status.eligibleForSelfHealCount) : '—'}
        />
      </div>
      <AdminConfigRow
        label="投递成功率"
        value={status ? `${status.deliveryRatePercent.toFixed(1)}%` : '加载中…'}
      />
    </AdminPanel>
  )
}
