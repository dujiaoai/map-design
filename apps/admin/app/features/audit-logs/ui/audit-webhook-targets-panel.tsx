import { useQuery } from '@tanstack/react-query'
import { RadioIcon } from 'lucide-react'

import { fetchAuditWebhookTargets } from '~/entities/admin-platform/api'
import { adminQueryKeys } from '~/shared/lib/admin-query-keys'
import {
  AdminConfigRow,
  AdminEmptyState,
  AdminPanel,
  AdminPanelHeader,
} from '~/shared/ui/admin-page-shell'
import { AdminTableSkeleton } from '~/shared/ui/admin-table-skeleton'

export function AuditWebhookTargetsPanel() {
  const query = useQuery({
    queryKey: adminQueryKeys.auditWebhookTargets,
    queryFn: fetchAuditWebhookTargets,
  })

  return (
    <AdminPanel>
      <AdminPanelHeader
        icon={RadioIcon}
        title="Webhook 多目标路由"
        description="除主 webhook 外的附加 SIEM 投递目标（Phase 13-3）"
      />
      {query.isLoading ? (
        <AdminTableSkeleton rows={2} columns={1} />
      ) : query.isError ? (
        <AdminEmptyState
          icon={RadioIcon}
          message="无法加载投递目标"
          onRetry={() => void query.refetch()}
          isRetrying={query.isFetching}
        />
      ) : (
        <div className="space-y-2 px-4 pb-4">
          <AdminConfigRow label="主 Webhook" value={query.data?.primaryWebhookUrl || '—'} mono />
          {!query.data?.targets.length ? (
            <p className="text-sm text-muted-foreground">暂无附加目标</p>
          ) : (
            <ul className="divide-y divide-border/60">
              {query.data.targets.map((t) => (
                <li key={t.id} className="py-2 text-sm">
                  <span className="font-mono text-xs break-all">{t.url}</span>
                  <span className="ml-2 text-muted-foreground">
                    {t.format} · priority {t.priority} · {t.enabled ? '启用' : '禁用'}
                  </span>
                </li>
              ))}
            </ul>
          )}
        </div>
      )}
    </AdminPanel>
  )
}
