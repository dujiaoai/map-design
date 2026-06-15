import { Badge, Button, Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@repo/ui'
import { CreditCardIcon } from 'lucide-react'
import { useState } from 'react'
import { Link } from 'react-router'

import { buildAuditBillingLink } from '~/features/audit-logs/lib/audit-log-billing-nav'
import { fetchAdminAuditLogs, type AdminAuditLogEntry } from '~/shared/api/admin-api'
import { useAdminPermissions } from '~/shared/hooks/use-admin-permissions'
import { useAdminPagedListState, useAdminPagedQuery } from '~/shared/hooks/use-admin-paged-list'
import { adminQueryKeys } from '~/shared/lib/admin-query-keys'
import { appendAdminListTotal } from '~/shared/lib/format-admin-list-description'
import {
  AdminDataTable,
  AdminTableBody,
  AdminTableCell,
  AdminTableHead,
  AdminTableHeaderCell,
  AdminTableRow,
} from '~/shared/ui/admin-data-table'
import { AdminEmptyState, AdminPageHeader, AdminPanel } from '~/shared/ui/admin-page-shell'
import { AdminIdCell } from '~/shared/ui/admin-id-cell'
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
  { value: 'billing.recharge.refund', label: '充值退款' },
] as const

const BILLING_PERMISSIONS = [
  'admin:billing:read',
  'admin:billing:adjust',
  'admin:billing:packages:write',
  'admin:billing:refund',
] as const

export function AuditLogsAdminPage() {
  const { can, canAny } = useAdminPermissions()
  const canViewBilling = canAny([...BILLING_PERMISSIONS])
  const canReadTenants = can('admin:tenants:read')
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
    <div className="space-y-6 admin-stagger">
      <AdminPageHeader
        eyebrow="Operations"
        title="审计日志"
        description={appendAdminListTotal(
          '记录成员邀请、角色变更与平台计费操作（调账、SKU）；跨租户操作会标记 crossTenant。',
          { total, loaded: Boolean(query.data), unit: '条' },
        )}
        actions={
          canViewBilling ? (
            <Button
              nativeButton={false}
              variant="outline"
              size="sm"
              render={<Link to="/billing" />}
            >
              <CreditCardIcon className="size-3.5" />
              计费运营
            </Button>
          ) : null
        }
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
          <AdminTableSkeleton columns={6} showPagination />
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
                  <AdminTableHeaderCell>目标租户</AdminTableHeaderCell>
                  <AdminTableHeaderCell>跨租户</AdminTableHeaderCell>
                </tr>
              </AdminTableHead>
              <AdminTableBody>
                {query.data.logs.map((log) => (
                  <AuditLogRow key={log.id} log={log} canReadTenants={canReadTenants} />
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

function AuditLogRow({
  log,
  canReadTenants,
}: {
  log: AdminAuditLogEntry
  canReadTenants: boolean
}) {
  const billingLink = buildAuditBillingLink(log.action, log.targetTenantId)

  return (
    <AdminTableRow>
      <AdminTableCell className="text-muted-foreground">
        {formatAdminDate(log.createdAt)}
      </AdminTableCell>
      <AdminTableCell>{log.actorEmail}</AdminTableCell>
      <AdminTableCell>
        <span className="font-mono text-xs">{log.action}</span>
        {billingLink ? (
          <Link
            to={billingLink}
            className="ml-2 text-xs text-primary underline-offset-4 hover:underline"
          >
            查看计费
          </Link>
        ) : null}
      </AdminTableCell>
      <AdminTableCell className="max-w-md truncate">{log.detail ?? '—'}</AdminTableCell>
      <AdminTableCell>
        {log.targetTenantId ? (
          <div className="space-y-1">
            <AdminIdCell value={log.targetTenantId} label="租户" />
            {canReadTenants ? (
              <Link
                to={`/tenants/${log.targetTenantId}?tab=info`}
                className="text-xs text-primary underline-offset-4 hover:underline"
              >
                租户详情
              </Link>
            ) : null}
          </div>
        ) : (
          <span className="text-muted-foreground">—</span>
        )}
      </AdminTableCell>
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
