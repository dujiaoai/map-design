import { cn } from '@repo/ui'

import type { AdminFinOpsCostAttribution } from '~/entities/admin-platform/model'

function formatUsd(value: number) {
  return `$${value.toFixed(2)}`
}

export function AdminFinOpsPanel({ finops }: { finops: AdminFinOpsCostAttribution }) {
  const segments = [
    { label: 'Billing API', value: finops.billingApiCostUsd, tone: 'bg-primary' },
    { label: '席位', value: finops.seatCostUsd, tone: 'bg-sky-400/80' },
    { label: '存储', value: finops.storageCostUsd, tone: 'bg-emerald-500/75' },
  ].filter((item) => item.value > 0)

  const maxConsumer = Math.max(
    1,
    ...finops.topConsumers.map((c) => c.estimatedMonthlyCostUsd),
  )

  return (
    <div className="space-y-4 px-4 pb-5 md:px-5">
      <div className="rounded-xl border border-border/50 bg-muted/10 p-4">
        <p className="text-xs text-muted-foreground">月度估算总成本</p>
        <p className="admin-display mt-1 text-3xl font-semibold tabular-nums tracking-tight">
          {formatUsd(finops.totalEstimatedMonthlyCostUsd)}
        </p>
        {segments.length > 0 ? (
          <div className="mt-4 space-y-2">
            <div className="admin-finops-stack flex h-2.5 overflow-hidden rounded-full bg-muted/40">
              {segments.map((segment) => (
                <div
                  key={segment.label}
                  className={cn('h-full min-w-[4px] transition-all', segment.tone)}
                  style={{
                    width: `${Math.max(4, (segment.value / finops.totalEstimatedMonthlyCostUsd) * 100)}%`,
                  }}
                  title={`${segment.label}: ${formatUsd(segment.value)}`}
                />
              ))}
            </div>
            <ul className="grid gap-2 sm:grid-cols-3">
              {segments.map((segment) => (
                <li
                  key={segment.label}
                  className="flex items-center justify-between gap-2 rounded-lg border border-border/40 px-3 py-2 text-xs"
                >
                  <span className="flex items-center gap-2 text-muted-foreground">
                    <span className={cn('size-2 rounded-full', segment.tone)} aria-hidden />
                    {segment.label}
                  </span>
                  <span className="font-mono font-medium">{formatUsd(segment.value)}</span>
                </li>
              ))}
            </ul>
          </div>
        ) : null}
      </div>

      {finops.topConsumers.length ? (
        <div>
          <p className="mb-2 text-xs font-medium text-muted-foreground">成本 Top 租户</p>
          <ul className="space-y-2">
            {finops.topConsumers.map((consumer, index) => (
              <li
                key={consumer.tenantId}
                className="rounded-lg border border-border/45 bg-background/25 px-3 py-2.5"
              >
                <div className="flex items-start justify-between gap-3">
                  <div className="min-w-0">
                    <p className="flex items-center gap-2 text-sm font-medium">
                      <span className="admin-display text-[10px] tracking-wider text-primary/70">
                        #{index + 1}
                      </span>
                      <span className="truncate">{consumer.tenantName}</span>
                    </p>
                    <p className="mt-0.5 text-[11px] text-muted-foreground">
                      Billing {consumer.billingApiCalls} 次 · 席位 {consumer.seatCount}
                    </p>
                  </div>
                  <span className="shrink-0 font-mono text-xs font-medium">
                    {formatUsd(consumer.estimatedMonthlyCostUsd)}
                  </span>
                </div>
                <div className="mt-2 h-1.5 overflow-hidden rounded-full bg-muted/40">
                  <div
                    className="h-full rounded-full bg-primary/70"
                    style={{
                      width: `${Math.round((consumer.estimatedMonthlyCostUsd / maxConsumer) * 100)}%`,
                    }}
                  />
                </div>
              </li>
            ))}
          </ul>
        </div>
      ) : (
        <p className="text-xs text-muted-foreground">暂无租户级成本归因数据。</p>
      )}
    </div>
  )
}
