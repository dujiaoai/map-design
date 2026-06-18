import type { AdminUsageDayBucket } from '~/entities/admin-platform/model'

function maxValue(days: AdminUsageDayBucket[], pick: (day: AdminUsageDayBucket) => number) {
  return Math.max(1, ...days.map(pick))
}

export function AdminUsageTrendChart({ days }: { days: AdminUsageDayBucket[] }) {
  if (days.length === 0) {
    return <p className="px-4 py-4 text-sm text-muted-foreground md:px-5">暂无趋势数据</p>
  }

  const maxUsers = maxValue(days, (d) => d.newUsers)
  const maxAudit = maxValue(days, (d) => d.auditEvents)
  const maxTenants = maxValue(days, (d) => d.activeTenants)
  const maxBilling = maxValue(days, (d) => d.billingApiCallsPerDay ?? 0)

  return (
    <div className="space-y-4 px-4 pb-4 md:px-5">
      {days.map((day) => (
        <div key={day.date} className="space-y-1.5">
          <div className="flex items-center justify-between text-xs text-muted-foreground">
            <span className="font-mono">{day.date}</span>
            <span>
              用户 {day.newUsers} · 审计 {day.auditEvents} · 租户 {day.activeTenants} · Billing{' '}
              {day.billingApiCallsPerDay ?? 0}
            </span>
          </div>
          <div className="grid grid-cols-4 gap-2">
            <Bar label="用户" ratio={day.newUsers / maxUsers} />
            <Bar label="审计" ratio={day.auditEvents / maxAudit} />
            <Bar label="租户" ratio={day.activeTenants / maxTenants} />
            <Bar label="Billing" ratio={(day.billingApiCallsPerDay ?? 0) / maxBilling} />
          </div>
        </div>
      ))}
    </div>
  )
}

function Bar({ label, ratio }: { label: string; ratio: number }) {
  return (
    <div className="space-y-1">
      <div className="h-16 rounded-md bg-muted/40 p-1 flex flex-col justify-end">
        <div
          className="w-full rounded-sm bg-primary/70 transition-all"
          style={{ height: `${Math.round(Math.min(1, ratio) * 100)}%` }}
          title={label}
        />
      </div>
      <p className="text-center text-[10px] text-muted-foreground">{label}</p>
    </div>
  )
}
