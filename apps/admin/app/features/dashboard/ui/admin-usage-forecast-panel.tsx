import { cn } from '@repo/ui'

import type {
  AdminUsageCapacityRecommendation,
  AdminUsageForecastResponse,
} from '~/entities/admin-platform/model'

const FORECAST_SERIES = [
  { key: 'newUsers' as const, label: '新增用户', tone: 'bg-primary' },
  { key: 'auditEvents' as const, label: '审计事件', tone: 'bg-sky-400/80' },
  { key: 'billingApiCalls' as const, label: 'Billing API', tone: 'bg-amber-400/80' },
] as const

export function AdminUsageForecastPanel({
  forecast,
  recommendations,
}: {
  forecast: AdminUsageForecastResponse
  recommendations: AdminUsageCapacityRecommendation[]
}) {
  return (
    <div className="space-y-5 px-4 pb-5 md:px-5">
      <p className="text-xs text-muted-foreground">
        基于近 7 日数据的线性外推；供容量规划与告警阈值参考。
      </p>

      <div className="grid gap-3 lg:grid-cols-3">
        {FORECAST_SERIES.map((series) => (
          <ForecastSection
            key={series.key}
            title={series.label}
            tone={series.tone}
            days={forecast[series.key]}
          />
        ))}
      </div>

      {recommendations.length ? (
        <div>
          <p className="mb-2 text-xs font-medium text-muted-foreground">容量建议</p>
          <ul className="grid gap-2 md:grid-cols-2">
            {recommendations.map((rec) => (
              <li
                key={rec.category}
                className="rounded-xl border border-border/50 bg-muted/10 px-3 py-3"
              >
                <div className="flex flex-wrap items-baseline gap-x-2 gap-y-1">
                  <span className="text-sm font-medium">{rec.category}</span>
                  <span className="rounded-full border border-primary/25 bg-primary/10 px-2 py-0.5 text-[10px] text-primary">
                    {rec.action}
                  </span>
                </div>
                <p className="mt-1 text-xs text-muted-foreground">
                  预测均值 <span className="font-mono text-foreground">{rec.projectedAverage}</span>
                </p>
                <p className="mt-1 text-[11px] leading-relaxed text-muted-foreground">
                  {rec.rationale}
                </p>
              </li>
            ))}
          </ul>
        </div>
      ) : null}
    </div>
  )
}

function ForecastSection({
  title,
  tone,
  days,
}: {
  title: string
  tone: string
  days: { date: string; projectedValue: number }[]
}) {
  if (!days.length) return null

  const max = Math.max(1, ...days.map((day) => day.projectedValue))
  const avg = days.reduce((sum, day) => sum + day.projectedValue, 0) / days.length

  return (
    <div className="rounded-xl border border-border/50 bg-background/20 p-3">
      <div className="flex items-center justify-between gap-2">
        <p className="text-xs font-medium">{title}</p>
        <span className="font-mono text-[11px] text-muted-foreground">均值 {avg.toFixed(1)}</span>
      </div>
      <div className="mt-3 flex items-end gap-1.5" style={{ height: '4.5rem' }}>
        {days.map((day) => (
          <div key={day.date} className="flex flex-1 flex-col items-center gap-1">
            <div className="admin-forecast-bar-track w-full">
              <div
                className={cn('admin-forecast-bar-fill', tone)}
                style={{ height: `${Math.round((day.projectedValue / max) * 100)}%` }}
                title={`${day.date}: ${day.projectedValue}`}
              />
            </div>
            <span className="font-mono text-[9px] text-muted-foreground">
              {day.date.slice(5)}
            </span>
          </div>
        ))}
      </div>
    </div>
  )
}
