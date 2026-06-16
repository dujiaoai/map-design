import { useQuery } from '@tanstack/react-query'

import { fetchTenantQuotas } from '~/shared/api/admin-api'
import { adminQueryKeys } from '~/shared/lib/admin-query-keys'
import { AdminPanel, AdminPanelHeader } from '~/shared/ui/admin-page-shell'

function formatBytes(bytes: number): string {
  if (bytes >= 1024 * 1024 * 1024) {
    return `${(bytes / (1024 * 1024 * 1024)).toFixed(0)} GB`
  }
  if (bytes >= 1024 * 1024) {
    return `${(bytes / (1024 * 1024)).toFixed(0)} MB`
  }
  return `${bytes} B`
}

function formatSeatLabel(limit: number | null, used: number): string {
  if (limit == null) {
    return `${used} / 不限`
  }
  return `${used} / ${limit}`
}

export function TenantQuotaSummary({ tenantId }: { tenantId: string }) {
  const quotasQuery = useQuery({
    queryKey: adminQueryKeys.tenantQuotas(tenantId),
    queryFn: () => fetchTenantQuotas(tenantId),
    staleTime: 30_000,
  })

  if (quotasQuery.isPending) {
    return (
      <AdminPanel className="mb-4">
        <AdminPanelHeader title="Plan 配额" />
        <p className="px-4 pb-4 text-sm text-muted-foreground">加载中…</p>
      </AdminPanel>
    )
  }

  if (quotasQuery.isError || !quotasQuery.data) {
    return null
  }

  const { plan, seats, apiRate, storage } = quotasQuery.data
  const seatFull = seats.limit != null && seats.used >= seats.limit

  return (
    <AdminPanel className="mb-4">
      <AdminPanelHeader title="Plan 配额" />
      <dl className="grid gap-3 px-4 pb-4 text-sm sm:grid-cols-3">
        <div>
          <dt className="text-muted-foreground">计划</dt>
          <dd className="font-mono">{plan}</dd>
        </div>
        <div>
          <dt className="text-muted-foreground">成员席位</dt>
          <dd className={seatFull ? 'text-destructive' : undefined}>
            {formatSeatLabel(seats.limit, seats.used)}
            {seatFull ? ' · 已满' : ''}
          </dd>
        </div>
        <div>
          <dt className="text-muted-foreground">API 速率</dt>
          <dd>{apiRate.limitPerMinute} 次/分钟</dd>
        </div>
        <div className="sm:col-span-3">
          <dt className="text-muted-foreground">存储</dt>
          <dd>
            {formatBytes(storage.usedBytes)} / {formatBytes(storage.limitBytes)}
          </dd>
        </div>
      </dl>
    </AdminPanel>
  )
}
