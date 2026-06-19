import { cn } from '@repo/ui'
import { ActivityIcon, Building2Icon, TrendingUpIcon, UsersIcon } from 'lucide-react'

import type { AdminStatsResponse } from '~/entities/admin-platform/model'
import { AdminStatusPill } from '~/shared/ui/admin-status-pill'

function formatRate(numerator: number, denominator: number) {
  if (denominator <= 0) return '—'
  return `${Math.round((numerator / denominator) * 100)}%`
}

export function AdminOverviewHero({
  stats,
  loading,
  apiHealthy,
  apiLoading,
}: {
  stats?: AdminStatsResponse
  loading: boolean
  apiHealthy: boolean
  apiLoading: boolean
}) {
  const tenantCount = stats?.tenantCount ?? 0
  const userCount = stats?.userCount ?? 0
  const activeTenants = stats?.activeTenantCount ?? 0
  const activeLast7 = stats?.activeTenantsLast7Days ?? 0
  const newUsers7d = stats?.newUsersLast7Days ?? 0

  return (
    <section className="admin-overview-hero admin-health-strip px-4 py-5 md:px-6 md:py-6">
      <div className="relative flex flex-wrap items-start justify-between gap-4">
        <div className="max-w-xl space-y-1">
          <p className="admin-display text-xs tracking-[0.22em] text-primary/75 uppercase">
            Platform Pulse
          </p>
          <p className="text-sm text-muted-foreground">
            实时汇总租户规模、成员增长与 API 连通性；每 30 秒可手动刷新。
          </p>
        </div>
        {apiLoading ? null : (
          <AdminStatusPill
            level={apiHealthy ? 'ok' : 'warn'}
            label={apiHealthy ? 'Admin API 在线' : 'Admin API 异常'}
          />
        )}
      </div>

      <div className="relative mt-5 grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
        <HeroStat
          icon={Building2Icon}
          label="租户规模"
          value={loading ? null : tenantCount}
          detail={`活跃 ${loading ? '—' : activeTenants} · 占比 ${loading ? '—' : formatRate(activeTenants, tenantCount)}`}
        />
        <HeroStat
          icon={UsersIcon}
          label="用户规模"
          value={loading ? null : userCount}
          detail={`近 7 日新增 ${loading ? '—' : newUsers7d}`}
        />
        <HeroStat
          icon={ActivityIcon}
          label="近 7 日活跃租户"
          value={loading ? null : activeLast7}
          detail={`占租户 ${loading ? '—' : formatRate(activeLast7, tenantCount)}`}
        />
        <HeroStat
          icon={TrendingUpIcon}
          label="增长动能"
          value={loading ? null : newUsers7d}
          detail="7 日新增用户"
          accent
        />
      </div>
    </section>
  )
}

function HeroStat({
  icon: Icon,
  label,
  value,
  detail,
  accent = false,
}: {
  icon: typeof Building2Icon
  label: string
  value: number | null
  detail: string
  accent?: boolean
}) {
  return (
    <div
      className={cn(
        'admin-overview-hero-stat rounded-xl border px-4 py-3.5',
        accent
          ? 'border-primary/30 bg-primary/8'
          : 'border-border/45 bg-background/30',
      )}
    >
      <div className="flex items-center gap-2 text-xs text-muted-foreground">
        <Icon className="size-3.5 text-primary" aria-hidden />
        {label}
      </div>
      <p className="admin-display mt-2 text-2xl font-semibold tabular-nums tracking-tight">
        {value === null ? (
          <span className="inline-block h-7 w-14 animate-pulse rounded-md bg-muted/50" />
        ) : (
          value
        )}
      </p>
      <p className="mt-1 text-[11px] text-muted-foreground">{detail}</p>
    </div>
  )
}
