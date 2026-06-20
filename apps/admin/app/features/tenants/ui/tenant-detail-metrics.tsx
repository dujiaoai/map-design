import { cn } from '@repo/ui'
import { useQuery } from '@tanstack/react-query'
import { GaugeIcon, HardDriveIcon, UsersIcon, ZapIcon } from 'lucide-react'

import { formatTenantPlanLabel } from '~/features/tenants/lib/tenant-create-options'
import { fetchTenantQuotas } from '~/shared/api/admin-api'
import { adminQueryKeys } from '~/shared/lib/admin-query-keys'

function formatBytes(bytes: number): string {
  if (bytes >= 1024 * 1024 * 1024) {
    return `${(bytes / (1024 * 1024 * 1024)).toFixed(1)} GB`
  }
  if (bytes >= 1024 * 1024) {
    return `${(bytes / (1024 * 1024)).toFixed(0)} MB`
  }
  return `${bytes} B`
}

function formatSeatLabel(limit: number | null, used: number): string {
  if (limit == null) return `${used} / 不限`
  return `${used} / ${limit}`
}

export function TenantDetailMetrics({ tenantId }: { tenantId: string }) {
  const quotasQuery = useQuery({
    queryKey: adminQueryKeys.tenantQuotas(tenantId),
    queryFn: () => fetchTenantQuotas(tenantId),
    staleTime: 30_000,
  })

  if (quotasQuery.isPending) {
    return (
      <div className="grid gap-2 sm:grid-cols-2 lg:grid-cols-4">
        {Array.from({ length: 4 }).map((_, index) => (
          <div
            key={index}
            className="h-[4.5rem] animate-pulse rounded-xl border border-border/50 bg-muted/20"
          />
        ))}
      </div>
    )
  }

  if (quotasQuery.isError || !quotasQuery.data) {
    return null
  }

  const { plan, seats, apiRate, storage } = quotasQuery.data
  const seatFull = seats.limit != null && seats.used >= seats.limit
  const storageRatio = storage.limitBytes > 0 ? storage.usedBytes / storage.limitBytes : 0
  const storageHigh = storageRatio >= 0.9

  const metrics = [
    {
      icon: GaugeIcon,
      label: '订阅计划',
      value: formatTenantPlanLabel(plan),
      hint: '当前计费档位',
      warn: false,
    },
    {
      icon: UsersIcon,
      label: '成员席位',
      value: formatSeatLabel(seats.limit, seats.used),
      hint: seatFull ? '席位已满' : '已用 / 上限',
      warn: seatFull,
    },
    {
      icon: ZapIcon,
      label: 'API 速率',
      value: `${apiRate.limitPerMinute}/分钟`,
      hint: '租户级限流',
      warn: false,
    },
    {
      icon: HardDriveIcon,
      label: '存储用量',
      value: `${formatBytes(storage.usedBytes)} / ${formatBytes(storage.limitBytes)}`,
      hint: storageHigh ? '接近上限' : '附件与图层',
      warn: storageHigh,
    },
  ]

  return (
    <div className="grid gap-2 sm:grid-cols-2 lg:grid-cols-4">
      {metrics.map((metric) => (
        <div
          key={metric.label}
          className={cn(
            'rounded-xl border px-3 py-3 transition-colors',
            metric.warn
              ? 'border-destructive/35 bg-destructive/6'
              : 'border-border/50 bg-background/25',
          )}
        >
          <div className="flex items-center gap-2 text-xs text-muted-foreground">
            <metric.icon className="size-3.5 shrink-0 text-primary" aria-hidden />
            <span>{metric.label}</span>
          </div>
          <p
            className={cn(
              'admin-display mt-1.5 truncate text-sm font-semibold tabular-nums',
              metric.warn && 'text-destructive',
            )}
          >
            {metric.value}
          </p>
          <p className="mt-0.5 text-[10px] text-muted-foreground">{metric.hint}</p>
        </div>
      ))}
    </div>
  )
}
