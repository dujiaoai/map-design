import { Badge } from '@repo/ui'

import { fetchAdminAuditLogs, type AdminAuditLogEntry } from '~/shared/api/admin-api'
import { useAdminPagedListState, useAdminPagedQuery } from '~/shared/hooks/use-admin-paged-list'
import { adminQueryKeys } from '~/shared/lib/admin-query-keys'
import {
  AdminDataTable,
  AdminTableBody,
  AdminTableCell,
  AdminTableHead,
  AdminTableHeaderCell,
  AdminTableRow,
} from '~/shared/ui/admin-data-table'
import { AdminEmptyState, AdminPageHeader, AdminPanel } from '~/shared/ui/admin-page-shell'
import { AdminTablePagination } from '~/shared/ui/admin-table-pagination'
import { AdminTableSkeleton } from '~/shared/ui/admin-table-skeleton'
import { AdminTableToolbar } from '~/shared/ui/admin-table-toolbar'
import { formatAdminDate } from '~/shared/ui/admin-status-badge'

export function AuditLogsAdminPage() {
  const { searchInput, setSearchInput, page, setPage, queryParams } = useAdminPagedListState()

  const query = useAdminPagedQuery({
    queryKey: adminQueryKeys.auditLogs(queryParams),
    queryFn: () => fetchAdminAuditLogs(queryParams),
  })

  const total = query.data?.total ?? query.data?.logs.length ?? 0

  return (
    <div className="space-y-6">
      <AdminPageHeader
        title="审计日志"
        description="记录成员邀请、更新与角色分配；跨租户操作会标记 crossTenant。"
      />

      <AdminTableToolbar
        search={searchInput}
        onSearchChange={setSearchInput}
        searchPlaceholder="搜索操作人、动作或详情…"
      />

      <AdminPanel className="p-0">
        {query.isLoading ? (
          <AdminTableSkeleton columns={5} showPagination />
        ) : query.isError ? (
          <AdminEmptyState message="加载失败，请刷新重试" />
        ) : !query.data?.logs.length ? (
          <AdminEmptyState message="暂无审计记录" />
        ) : (
          <>
            <AdminDataTable>
              <AdminTableHead>
                <tr>
                  <AdminTableHeaderCell>时间</AdminTableHeaderCell>
                  <AdminTableHeaderCell>操作人</AdminTableHeaderCell>
                  <AdminTableHeaderCell>动作</AdminTableHeaderCell>
                  <AdminTableHeaderCell>详情</AdminTableHeaderCell>
                  <AdminTableHeaderCell>跨租户</AdminTableHeaderCell>
                </tr>
              </AdminTableHead>
              <AdminTableBody>
                {query.data.logs.map((log) => (
                  <AuditLogRow key={log.id} log={log} />
                ))}
              </AdminTableBody>
            </AdminDataTable>
            <AdminTablePagination
              page={page}
              pageSize={queryParams.size}
              total={total}
              onPageChange={setPage}
            />
          </>
        )}
      </AdminPanel>
    </div>
  )
}

function AuditLogRow({ log }: { log: AdminAuditLogEntry }) {
  return (
    <AdminTableRow>
      <AdminTableCell className="text-muted-foreground">
        {formatAdminDate(log.createdAt)}
      </AdminTableCell>
      <AdminTableCell>{log.actorEmail}</AdminTableCell>
      <AdminTableCell mono>{log.action}</AdminTableCell>
      <AdminTableCell className="max-w-md truncate">{log.detail ?? '—'}</AdminTableCell>
      <AdminTableCell>
        {log.crossTenant ? (
          <Badge variant="outline" className="font-mono text-[10px]">
            cross
          </Badge>
        ) : (
          <span className="text-muted-foreground">—</span>
        )}
      </AdminTableCell>
    </AdminTableRow>
  )
}
