import { useQuery } from '@tanstack/react-query'
import { ArchiveIcon } from 'lucide-react'

import { fetchAdminAuditWebhookArchiveSummary } from '~/entities/audit-log/api'
import { adminQueryKeys } from '~/shared/lib/admin-query-keys'
import { AdminMetricCard, AdminPanel, AdminPanelHeader } from '~/shared/ui/admin-page-shell'

export function AuditWebhookArchiveSummaryPanel() {
  const query = useQuery({
    queryKey: adminQueryKeys.auditWebhookArchiveSummary,
    queryFn: fetchAdminAuditWebhookArchiveSummary,
  })

  return (
    <AdminPanel>
      <AdminPanelHeader
        icon={ArchiveIcon}
        title="Webhook 合规归档"
        description="投递批次合规保留摘要（Phase 16-3）"
      />
      <div className="grid gap-3 sm:grid-cols-2">
        <AdminMetricCard
          label="归档总数"
          value={query.data ? String(query.data.totalArchived) : '—'}
        />
        <AdminMetricCard
          label="区域数"
          value={query.data ? String(query.data.byRegion.length) : '—'}
        />
      </div>
      {query.data?.byRegion.length ? (
        <ul className="px-4 pb-4 text-sm text-muted-foreground">
          {query.data.byRegion.map((row) => (
            <li key={row.region}>
              {row.region}: {row.count}
            </li>
          ))}
        </ul>
      ) : null}
    </AdminPanel>
  )
}
