import { cn } from '@repo/ui'

import type { AdminUsageDayBucket } from '~/entities/admin-platform/model'

const SERIES = [
  { key: 'newUsers' as const, label: '用户', color: 'bg-primary' },
  { key: 'auditEvents' as const, label: '审计', color: 'bg-sky-400/80' },
  { key: 'activeTenants' as const, label: '租户', color: 'bg-emerald-500/75' },
  { key: 'billingApiCallsPerDay' as const, label: 'Billing', color: 'bg-amber-400/80' },
]

function maxValue(days: AdminUsageDayBucket[], pick: (day: AdminUsageDayBucket) => number) {
  return Math.max(1, ...days.map(pick))
}

function pickMetric(day: AdminUsageDayBucket, key: (typeof SERIES)[number]['key']) {
  if (key === 'billingApiCallsPerDay') return day.billingApiCallsPerDay ?? 0
  return day[key]
}

function sumMetric(days: AdminUsageDayBucket[], key: (typeof SERIES)[number]['key']) {
  return days.reduce((sum, day) => sum + pickMetric(day, key), 0)
}

export function AdminUsageTrendChart({ days }: { days: AdminUsageDayBucket[] }) {
  if (days.length === 0) {
    return <p className="px-4 py-8 text-center text-sm text-muted-foreground md:px-5">暂无趋势数据</p>
  }

  const totals = SERIES.map((series) => ({
    ...series,
    total: sumMetric(days, series.key),
    max: maxValue(days, (day) => pickMetric(day, series.key)),
  }))

  return (
    <div className="space-y-5 px-4 pb-5 md:px-5">
      <div className="grid gap-2 sm:grid-cols-4">
        {totals.map((series) => (
          <div
            key={series.key}
            className="admin-trend-summary rounded-lg border border-border/50 bg-muted/10 px-3 py-2.5"
          >
            <div className="flex items-center gap-2">
              <span className={cn('size-2 rounded-full', series.color)} aria-hidden />
              <span className="text-xs text-muted-foreground">{series.label} 7 日合计</span>
            </div>
            <p className="admin-display mt-1 text-lg font-semibold tabular-nums">{series.total}</p>
          </div>
        ))}
      </div>

      <div className="admin-trend-chart rounded-xl border border-border/50 bg-background/20 p-4">
        <div className="mb-3 flex flex-wrap items-center justify-between gap-2">
          <p className="text-xs font-medium text-muted-foreground">按日分布</p>
          <div className="flex flex-wrap gap-3">
            {SERIES.map((series) => (
              <span key={series.key} className="flex items-center gap-1.5 text-[11px] text-muted-foreground">
                <span className={cn('size-2 rounded-sm', series.color)} aria-hidden />
                {series.label}
              </span>
            ))}
          </div>
        </div>

        <div className="space-y-3">
          {days.map((day) => (
            <div key={day.date} className="group">
              <div className="mb-1.5 flex items-center justify-between gap-3 text-xs">
                <span className="font-mono text-muted-foreground">{day.date}</span>
                <span className="truncate text-muted-foreground/90">
                  用户 {day.newUsers} · 审计 {day.auditEvents} · 租户 {day.activeTenants} · Billing{' '}
                  {day.billingApiCallsPerDay ?? 0}
                </span>
              </div>
              <div className="grid grid-cols-4 gap-1.5">
                {SERIES.map((series) => {
                  const value = pickMetric(day, series.key)
                  const ratio = value / totals.find((t) => t.key === series.key)!.max
                  return (
                    <div key={series.key} className="admin-trend-bar-cell">
                      <div className="admin-trend-bar-track">
                        <div
                          className={cn('admin-trend-bar-fill', series.color)}
                          style={{ height: `${Math.round(Math.min(1, ratio) * 100)}%` }}
                          title={`${series.label}: ${value}`}
                        />
                      </div>
                    </div>
                  )
                })}
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}
