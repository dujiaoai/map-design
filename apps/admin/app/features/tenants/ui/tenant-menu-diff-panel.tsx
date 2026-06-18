import { useQuery } from '@tanstack/react-query'

import { fetchTenantMenuDiff } from '~/shared/api/admin-api'
import { adminQueryKeys } from '~/shared/lib/admin-query-keys'
import { AdminEmptyState, AdminPanel, AdminPanelHeader } from '~/shared/ui/admin-page-shell'
import { AdminTableSkeleton } from '~/shared/ui/admin-table-skeleton'
import { LayoutListIcon } from 'lucide-react'

export function TenantMenuDiffPanel({ tenantId }: { tenantId: string }) {
  const query = useQuery({
    queryKey: adminQueryKeys.tenantMenuDiff(tenantId),
    queryFn: () => fetchTenantMenuDiff(tenantId),
  })

  return (
    <AdminPanel>
      <AdminPanelHeader
        icon={LayoutListIcon}
        title="菜单 diff"
        description="平台模板 vs 租户覆盖（Phase 7-4）"
      />
      {query.isLoading ? (
        <AdminTableSkeleton rows={2} columns={1} />
      ) : query.isError ? (
        <AdminEmptyState
          icon={LayoutListIcon}
          message="无法加载菜单 diff"
          onRetry={() => void query.refetch()}
          isRetrying={query.isFetching}
        />
      ) : !query.data?.entries.length ? (
        <p className="px-4 pb-4 text-sm text-muted-foreground">无覆盖 diff</p>
      ) : (
        <div className="overflow-x-auto px-4 pb-4">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-border/60 text-left text-muted-foreground">
                <th className="py-2 pr-3 font-medium">项 ID</th>
                <th className="py-2 pr-3 font-medium">模板</th>
                <th className="py-2 pr-3 font-medium">覆盖</th>
              </tr>
            </thead>
            <tbody>
              {query.data.entries.map((row) => (
                <tr key={row.itemId} className="border-b border-border/40">
                  <td className="py-2 pr-3 font-mono text-xs">{row.itemId}</td>
                  <td className="py-2 pr-3">
                    {row.templateTitle}
                    <span className="ml-2 text-muted-foreground">
                      {row.templateEnabled ? '启用' : '禁用'}
                    </span>
                  </td>
                  <td className="py-2 pr-3">
                    {row.overrideTitle ?? '—'}
                    {row.overrideEnabled != null ? (
                      <span className="ml-2 text-muted-foreground">
                        {row.overrideEnabled ? '启用' : '禁用'}
                      </span>
                    ) : null}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </AdminPanel>
  )
}
