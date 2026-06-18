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
import { AdminStatusPill } from '~/shared/ui/admin-status-pill'
import { AdminTableSkeleton } from '~/shared/ui/admin-table-skeleton'

function targetHealthLevel(target: {
  enabled: boolean
  consecutiveFailures: number
  unhealthySince: number | null
}): 'ok' | 'warn' | 'off' {
  if (!target.enabled && target.consecutiveFailures > 0) {
    return 'off'
  }
  if (target.consecutiveFailures > 0 || target.unhealthySince) {
    return 'warn'
  }
  return 'ok'
}

export function AuditWebhookTargetsPanel() {
  const query = useQuery({
    queryKey: adminQueryKeys.auditWebhookTargets,
    queryFn: fetchAuditWebhookTargets,
  })

  const degradedCount =
    query.data?.targets.filter((t) => !t.enabled && t.consecutiveFailures > 0).length ?? 0

  return (
    <AdminPanel>
      <AdminPanelHeader
        icon={RadioIcon}
        title="Webhook 多目标路由"
        description="除主 webhook 外的附加 SIEM 投递目标（Phase 13-3 / 14-3 健康探活）"
      />
      {degradedCount > 0 ? (
        <p className="px-4 pb-2 text-sm text-destructive">
          {degradedCount} 个目标因连续探活失败已自动降级禁用
        </p>
      ) : null}
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
                  <div className="flex flex-wrap items-center gap-2">
                    <span className="font-mono text-xs break-all">{t.url}</span>
                    <AdminStatusPill
                      level={targetHealthLevel(t)}
                      label={
                        !t.enabled && t.consecutiveFailures > 0
                          ? '已降级'
                          : t.consecutiveFailures > 0
                            ? `失败 ${t.consecutiveFailures}`
                            : '健康'
                      }
                    />
                  </div>
                  <span className="text-muted-foreground">
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
