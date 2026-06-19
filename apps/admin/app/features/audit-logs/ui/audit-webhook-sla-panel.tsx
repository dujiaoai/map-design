import { Badge } from '@repo/ui'
import { useQuery } from '@tanstack/react-query'
import { ActivityIcon } from 'lucide-react'

import { fetchAdminAuditWebhookSla } from '~/shared/api/admin-api'
import { adminQueryKeys } from '~/shared/lib/admin-query-keys'
import { AdminConfigRow, AdminPanel, AdminPanelHeader } from '~/shared/ui/admin-page-shell'
import { AdminMetricCard } from '~/shared/ui/admin-metric-card'

export function AuditWebhookSlaPanel() {
  const slaQuery = useQuery({
    queryKey: adminQueryKeys.auditWebhookSla,
    queryFn: fetchAdminAuditWebhookSla,
  })
  const sla = slaQuery.data

  return (
    <AdminPanel>
      <AdminPanelHeader
        icon={ActivityIcon}
        title="Webhook 投递 SLA"
        description={`近 ${sla?.windowDays ?? 7} 日投递健康度（Phase 12-3）`}
      />
      <div className="grid gap-3 sm:grid-cols-3">
        <AdminMetricCard
          label="投递成功率"
          value={sla ? `${sla.deliveryRatePercent.toFixed(1)}%` : '—'}
        />
        <AdminMetricCard label="待重试" value={sla ? String(sla.pendingDeadLetters) : '—'} />
        <AdminMetricCard label="死信总数" value={sla ? String(sla.deadLetterCount) : '—'} />
      </div>
      <AdminConfigRow
        label="平均延迟"
        value={sla ? `${sla.avgLatencyMs.toFixed(0)} ms` : '加载中…'}
      />
      {sla && sla.deliveryRatePercent < 95 ? (
        <Badge variant="destructive">SLA 告警：成功率低于 95%</Badge>
      ) : null}
    </AdminPanel>
  )
}
