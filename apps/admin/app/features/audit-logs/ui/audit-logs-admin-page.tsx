import { Badge, Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@repo/ui'
import { useState } from 'react'

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

const AUDIT_ACTION_OPTIONS = [
  { value: 'all', label: '全部动作' },
  { value: 'member.invite', label: '邀请成员' },
  { value: 'member.invite.resend', label: '重发邀请' },
  { value: 'member.invite-link.create', label: '创建邀请链接' },
  { value: 'member.invite-link.revoke', label: '撤销邀请链接' },
  { value: 'member.update', label: '更新成员' },
  { value: 'member.roles.update', label: '更新角色' },
  { value: 'billing.wallet.adjust', label: '计费调账' },
  { value: 'billing.package.write', label: 'SKU 变更' },
] as const

export function AuditLogsAdminPage() {
  const { searchInput, setSearchInput, page, setPage, queryParams } = useAdminPagedListState()
  const [actionFilter, setActionFilter] = useState<string>('all')
  const [crossTenantOnly, setCrossTenantOnly] = useState(false)

  const listQuery = {
    ...queryParams,
    action: actionFilter === 'all' ? undefined : actionFilter,
    crossTenant: crossTenantOnly ? true : undefined,
  }

  const query = useAdminPagedQuery({
    queryKey: adminQueryKeys.auditLogs(listQuery),
    queryFn: () => fetchAdminAuditLogs(listQuery),
  })

  const total = query.data?.total ?? query.data?.logs.length ?? 0

  return (
    <div className="space-y-6">
      <AdminPageHeader
        title="审计日志"
        description="记录成员邀请、角色变更与平台计费操作（调账、SKU）；跨租户操作会标记 crossTenant。"
      />

      <div className="flex flex-wrap items-center gap-3">
        <AdminTableToolbar
          search={searchInput}
          onSearchChange={setSearchInput}
          searchPlaceholder="搜索操作人、动作或详情…"
        />
        <Select
          value={actionFilter}
          onValueChange={(value) => {
            if (value == null) return
            setActionFilter(value)
            setPage(1)
          }}
        >
          <SelectTrigger className="w-[180px]">
            <SelectValue placeholder="动作类型" />
          </SelectTrigger>
          <SelectContent>
            {AUDIT_ACTION_OPTIONS.map((option) => (
              <SelectItem key={option.value} value={option.value}>
                {option.label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
        <label className="text-muted-foreground flex items-center gap-2 text-sm">
          <input
            type="checkbox"
            checked={crossTenantOnly}
            onChange={(event) => {
              setCrossTenantOnly(event.target.checked)
              setPage(1)
            }}
          />
          仅跨租户
        </label>
      </div>

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
