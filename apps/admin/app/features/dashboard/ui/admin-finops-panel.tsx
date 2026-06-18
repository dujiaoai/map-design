import type { AdminFinOpsCostAttribution } from '~/entities/admin-platform/model'

export function AdminFinOpsPanel({ finops }: { finops: AdminFinOpsCostAttribution }) {
  return (
    <div className="grid gap-3 sm:grid-cols-3 px-4 pb-4">
      <div className="rounded-md border border-border/60 p-3">
        <p className="text-xs text-muted-foreground">月度估算总成本</p>
        <p className="text-lg font-semibold">${finops.totalEstimatedMonthlyCostUsd.toFixed(2)}</p>
      </div>
      <div className="rounded-md border border-border/60 p-3">
        <p className="text-xs text-muted-foreground">Billing API</p>
        <p className="text-lg font-semibold">${finops.billingApiCostUsd.toFixed(2)}</p>
      </div>
      <div className="rounded-md border border-border/60 p-3">
        <p className="text-xs text-muted-foreground">席位</p>
        <p className="text-lg font-semibold">${finops.seatCostUsd.toFixed(2)}</p>
      </div>
      {finops.topConsumers.length ? (
        <ul className="col-span-full space-y-2 text-sm">
          {finops.topConsumers.map((c) => (
            <li key={c.tenantId} className="flex justify-between gap-2 rounded border border-border/40 px-3 py-2">
              <span>{c.tenantName}</span>
              <span className="font-mono text-xs">${c.estimatedMonthlyCostUsd.toFixed(2)}</span>
            </li>
          ))}
        </ul>
      ) : null}
    </div>
  )
}
