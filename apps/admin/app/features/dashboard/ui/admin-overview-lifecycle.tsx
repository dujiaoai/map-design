import { Building2Icon, PauseCircleIcon, TimerIcon } from 'lucide-react'

import type { AdminStatsResponse } from '~/entities/admin-platform/model'
import { AdminMetricCard } from '~/shared/ui/admin-metric-card'
import { AdminPanel, AdminPanelHeader } from '~/shared/ui/admin-page-shell'

export function AdminOverviewLifecycle({
  stats,
  loading,
  error,
  onRetry,
  isRetrying,
}: {
  stats?: AdminStatsResponse
  loading: boolean
  error: boolean
  onRetry: () => void
  isRetrying: boolean
}) {
  const trialTotal =
    (stats?.trialActiveTenantCount ?? 0) + (stats?.trialExpiredTenantCount ?? 0)

  return (
    <AdminPanel className="h-full">
      <AdminPanelHeader
        icon={TimerIcon}
        title="租户生命周期"
        description="试用与停用状态快照"
      />
      <div className="space-y-3 p-4 md:p-5">
        <AdminMetricCard
          className="!p-4"
          icon={PauseCircleIcon}
          label="已停用租户"
          value={stats?.suspendedTenantCount ?? 0}
          loading={loading}
          error={error}
          onRetry={onRetry}
          isRetrying={isRetrying}
        />
        <AdminMetricCard
          className="!p-4"
          icon={TimerIcon}
          label="试用中"
          value={stats?.trialActiveTenantCount ?? 0}
          loading={loading}
          error={error}
          onRetry={onRetry}
          isRetrying={isRetrying}
        />
        <AdminMetricCard
          className="!p-4"
          icon={Building2Icon}
          label="试用已到期"
          value={stats?.trialExpiredTenantCount ?? 0}
          loading={loading}
          error={error}
          onRetry={onRetry}
          isRetrying={isRetrying}
          hint="未停用但 trialEndsAt 已过"
        />
        {!loading && !error && trialTotal > 0 ? (
          <p className="rounded-lg border border-border/50 bg-muted/15 px-3 py-2 text-xs text-muted-foreground">
            试用相关租户共 <span className="font-medium text-foreground">{trialTotal}</span>{' '}
            家，建议定期回访试用到期列表。
          </p>
        ) : null}
      </div>
    </AdminPanel>
  )
}
