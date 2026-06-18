import { useQuery } from '@tanstack/react-query'
import { GitCompareIcon } from 'lucide-react'

import { fetchTenantScimChangePreview } from '~/entities/tenant/api'
import { adminQueryKeys } from '~/shared/lib/admin-query-keys'
import {
  AdminEmptyState,
  AdminMetricCard,
  AdminPanel,
  AdminPanelHeader,
} from '~/shared/ui/admin-page-shell'
import { AdminTableSkeleton } from '~/shared/ui/admin-table-skeleton'

export function TenantScimChangePreviewPanel({ tenantId }: { tenantId: string }) {
  const query = useQuery({
    queryKey: adminQueryKeys.tenantScimChangePreview(tenantId),
    queryFn: () => fetchTenantScimChangePreview(tenantId),
  })

  return (
    <AdminPanel>
      <AdminPanelHeader
        icon={GitCompareIcon}
        title="SCIM 变更预览"
        description="入站事件与出站队列 diff（Phase 16-2）"
      />
      {query.isLoading ? (
        <AdminTableSkeleton rows={3} columns={1} />
      ) : query.isError ? (
        <AdminEmptyState
          icon={GitCompareIcon}
          message="无法加载变更预览"
          onRetry={() => void query.refetch()}
          isRetrying={query.isFetching}
        />
      ) : (
        <div className="space-y-3 px-4 pb-4">
          <div className="grid gap-3 sm:grid-cols-2">
            <AdminMetricCard
              label="入站 pending"
              value={String(query.data?.inboundPendingCount ?? 0)}
            />
            <AdminMetricCard
              label="出站 pending"
              value={String(query.data?.outboundPendingCount ?? 0)}
            />
          </div>
          {!query.data?.items.length ? (
            <p className="text-sm text-muted-foreground">暂无待处理变更</p>
          ) : (
            <ul className="divide-y divide-border/60 text-sm">
              {query.data.items.map((item, idx) => (
                <li key={`${item.direction}-${item.externalId}-${idx}`} className="flex flex-wrap gap-2 py-2">
                  <span className="rounded bg-muted px-1.5 py-0.5 text-xs">{item.direction}</span>
                  <span className="font-mono text-xs">{item.externalId}</span>
                  <span className="text-muted-foreground">{item.type}</span>
                  <span>{item.statusOrOperation}</span>
                </li>
              ))}
            </ul>
          )}
        </div>
      )}
    </AdminPanel>
  )
}
