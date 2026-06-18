import type { AdminUsageCapacityRecommendation, AdminUsageForecastResponse } from '~/entities/admin-platform/model'

export function AdminUsageForecastPanel({
  forecast,
  recommendations,
}: {
  forecast: AdminUsageForecastResponse
  recommendations: AdminUsageCapacityRecommendation[]
}) {
  return (
    <div className="space-y-4 px-4 pb-4 md:px-5">
      <p className="text-sm text-muted-foreground">未来 7 日线性预测（Phase 14-4）</p>
      <ForecastSection title="新增用户" days={forecast.newUsers} />
      <ForecastSection title="审计事件" days={forecast.auditEvents} />
      <ForecastSection title="Billing API" days={forecast.billingApiCalls} />
      {recommendations.length ? (
        <ul className="space-y-2 text-sm">
          {recommendations.map((rec) => (
            <li key={rec.category} className="rounded-md border border-border/60 px-3 py-2">
              <span className="font-medium">{rec.category}</span>
              <span className="ml-2 text-muted-foreground">
                {rec.action} · 预测均值 {rec.projectedAverage}
              </span>
              <p className="text-xs text-muted-foreground">{rec.rationale}</p>
            </li>
          ))}
        </ul>
      ) : null}
    </div>
  )
}

function ForecastSection({
  title,
  days,
}: {
  title: string
  days: { date: string; projectedValue: number }[]
}) {
  if (!days.length) return null
  return (
    <div>
      <p className="mb-1 text-xs font-medium text-foreground">{title}</p>
      <div className="flex flex-wrap gap-2">
        {days.map((day) => (
          <span key={day.date} className="rounded bg-muted/40 px-2 py-1 font-mono text-xs">
            {day.date}: {day.projectedValue}
          </span>
        ))}
      </div>
    </div>
  )
}
