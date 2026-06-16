import { Badge, Button, Input, Label, Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@repo/ui'
import { CreditCardIcon } from 'lucide-react'
import { useMemo, useRef, useState } from 'react'
import { Link, useSearchParams } from 'react-router'

import { AUDIT_ACTION_OPTIONS } from '~/features/audit-logs/lib/audit-log-actions'
import { buildAuditBillingLink } from '~/features/audit-logs/lib/audit-log-billing-nav'
import {
  dateInputToFromEpoch,
  dateInputToToEpoch,
} from '~/features/audit-logs/lib/audit-log-date-range'
import { buildAuditUsersLink } from '~/features/audit-logs/lib/audit-log-users-nav'
import { AuditLogDetailSheet } from '~/features/audit-logs/ui/audit-log-detail-sheet'
import { fetchAdminAuditLogs, fetchAdminTenants, type AdminAuditLogEntry } from '~/shared/api/admin-api'
import { useAdminPermissions } from '~/shared/hooks/use-admin-permissions'
import { useAdminPagedListState, useAdminPagedQuery } from '~/shared/hooks/use-admin-paged-list'
import { useAdminListSearchShortcut } from '~/shared/hooks/use-admin-list-search-shortcut'
import { sortAdminTableRows, useAdminTableSort } from '~/shared/hooks/use-admin-table-sort'
import { adminQueryKeys } from '~/shared/lib/admin-query-keys'
import { appendAdminListTotal } from '~/shared/lib/format-admin-list-description'
import {
  AdminDataTable,
  AdminTableBody,
  AdminTableCell,
  AdminTableHead,
  AdminTableHeaderCell,
  AdminTableRow,
  AdminTableSortHeaderCell,
  AdminTableSortHint,
} from '~/shared/ui/admin-data-table'
import { AdminEmptyState, AdminPageHeader, AdminPanel } from '~/shared/ui/admin-page-shell'
import { AdminIdCell } from '~/shared/ui/admin-id-cell'
import { AdminTablePagination } from '~/shared/ui/admin-table-pagination'
import { AdminTableSkeleton } from '~/shared/ui/admin-table-skeleton'
import { AdminTableToolbar } from '~/shared/ui/admin-table-toolbar'
import { AdminTenantContextBanner } from '~/shared/ui/admin-tenant-context-banner'
import { formatAdminDate } from '~/shared/ui/admin-status-badge'

const AUDIT_BILLING_SEARCH = 'billing.'
const AUDIT_MEMBER_SEARCH = 'member.'

type AuditSortKey = 'createdAt' | 'actorEmail' | 'action'

const BILLING_PERMISSIONS = [
  'admin:billing:read',
  'admin:billing:adjust',
  'admin:billing:packages:write',
  'admin:billing:refund',
] as const

export function AuditLogsAdminPage() {
  const { can, canAny } = useAdminPermissions()
  const canViewBilling = canAny([...BILLING_PERMISSIONS])
  const canReadUsers = can('admin:users:read')
  const canReadTenants = can('admin:tenants:read')
  const [searchParams, setSearchParams] = useSearchParams()
  const tenantFilterId = searchParams.get('tenantId') ?? undefined

  const { searchInput, setSearchInput, page, setPage, queryParams } = useAdminPagedListState()
  const searchInputRef = useRef<HTMLInputElement>(null)
  useAdminListSearchShortcut(searchInputRef)
  const { sort, toggleSort, clearSort } = useAdminTableSort<AuditSortKey>()
  const [actionFilter, setActionFilter] = useState<string>('all')
  const [crossTenantOnly, setCrossTenantOnly] = useState(false)
  const [fromDate, setFromDate] = useState('')
  const [toDate, setToDate] = useState('')
  const [detailLog, setDetailLog] = useState<AdminAuditLogEntry | null>(null)

  const fromEpoch = dateInputToFromEpoch(fromDate)
  const toEpoch = dateInputToToEpoch(toDate)

  const listQuery = {
    ...queryParams,
    action: actionFilter === 'all' ? undefined : actionFilter,
    crossTenant: crossTenantOnly ? true : undefined,
    tenantId: tenantFilterId,
    from: fromEpoch,
    to: toEpoch,
  }

  const tenantsQuery = useAdminPagedQuery({
    queryKey: adminQueryKeys.tenantsAll,
    queryFn: () => fetchAdminTenants(),
  })

  const query = useAdminPagedQuery({
    queryKey: adminQueryKeys.auditLogs(listQuery),
    queryFn: () => fetchAdminAuditLogs(listQuery),
  })

  const tenantLabel = useMemo(() => {
    if (!tenantFilterId) return '全部租户'
    const tenant = tenantsQuery.data?.tenants.find((item) => item.id === tenantFilterId)
    return tenant ? `${tenant.name} (${tenant.slug})` : tenantFilterId
  }, [tenantFilterId, tenantsQuery.data?.tenants])

  const total = query.data?.total ?? query.data?.logs.length ?? 0
  const billingOnlyActive = searchInput.trim() === AUDIT_BILLING_SEARCH
  const memberOnlyActive = searchInput.trim() === AUDIT_MEMBER_SEARCH

  function toggleAuditPrefixFilter(prefix: string) {
    if (searchInput.trim() === prefix) {
      setSearchInput('')
    } else {
      setSearchInput(prefix)
      setActionFilter('all')
    }
    setPage(1)
  }

  function clearAuditFilters() {
    setSearchInput('')
    setActionFilter('all')
    setCrossTenantOnly(false)
    setFromDate('')
    setToDate('')
    setPage(1)
    clearSort()
    setSearchParams({})
  }

  const hasAuditFilters =
    actionFilter !== 'all' ||
    crossTenantOnly ||
    searchInput.trim().length > 0 ||
    Boolean(tenantFilterId) ||
    fromDate.length > 0 ||
    toDate.length > 0

  const sortedLogs = useMemo(
    () =>
      sortAdminTableRows(query.data?.logs ?? [], sort, {
        createdAt: (log) => log.createdAt,
        actorEmail: (log) => log.actorEmail.toLowerCase(),
        action: (log) => log.action.toLowerCase(),
      }),
    [query.data?.logs, sort],
  )

  return (
    <div className="space-y-6 admin-stagger">
      <AdminPageHeader
        eyebrow="Operations"
        title="审计日志"
        description={appendAdminListTotal(
          '记录租户、成员、平台用户与计费写操作；跨租户操作会标记 crossTenant。',
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

      {tenantFilterId ? (
        <AdminTenantContextBanner
          tenantId={tenantFilterId}
          tenantLabel={tenantLabel}
          showUsersLink
          onClear={() => setSearchParams({})}
        />
      ) : null}

      <div className="flex flex-wrap items-end gap-3">
        <AdminTableToolbar
          searchInputRef={searchInputRef}
          search={searchInput}
          onSearchChange={setSearchInput}
          searchPlaceholder="搜索操作人、动作或详情…"
        />
        <div className="space-y-1">
          <Label htmlFor="audit-tenant-filter" className="text-xs text-muted-foreground">
            目标租户
          </Label>
          <Select
            value={tenantFilterId ?? 'all'}
            onValueChange={(value) => {
              setPage(1)
              if (!value || value === 'all') {
                setSearchParams({})
                return
              }
              setSearchParams({ tenantId: value })
            }}
          >
            <SelectTrigger id="audit-tenant-filter" className="min-w-[200px]">
              <SelectValue>{tenantLabel}</SelectValue>
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">全部租户</SelectItem>
              {(tenantsQuery.data?.tenants ?? []).map((tenant) => (
                <SelectItem key={tenant.id} value={tenant.id}>
                  {tenant.name} ({tenant.slug})
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
        <Select
          value={actionFilter}
          onValueChange={(value) => {
            if (value == null) return
            setActionFilter(value)
            if (value !== 'all' && (billingOnlyActive || memberOnlyActive)) {
              setSearchInput('')
            }
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
        <div className="space-y-1">
          <Label htmlFor="audit-from-date" className="text-xs text-muted-foreground">
            起始日期
          </Label>
          <Input
            id="audit-from-date"
            type="date"
            value={fromDate}
            className="w-[160px]"
            onChange={(event) => {
              setFromDate(event.target.value)
              setPage(1)
            }}
          />
        </div>
        <div className="space-y-1">
          <Label htmlFor="audit-to-date" className="text-xs text-muted-foreground">
            结束日期
          </Label>
          <Input
            id="audit-to-date"
            type="date"
            value={toDate}
            className="w-[160px]"
            onChange={(event) => {
              setToDate(event.target.value)
              setPage(1)
            }}
          />
        </div>
        {canViewBilling ? (
          <Button
            type="button"
            variant={billingOnlyActive ? 'secondary' : 'outline'}
            size="sm"
            onClick={() => toggleAuditPrefixFilter(AUDIT_BILLING_SEARCH)}
          >
            仅计费
          </Button>
        ) : null}
        <Button
          type="button"
          variant={memberOnlyActive ? 'secondary' : 'outline'}
          size="sm"
          onClick={() => toggleAuditPrefixFilter(AUDIT_MEMBER_SEARCH)}
        >
          仅成员
        </Button>
        <Button
          type="button"
          variant={crossTenantOnly ? 'secondary' : 'outline'}
          size="sm"
          onClick={() => {
            setCrossTenantOnly((current) => !current)
            setPage(1)
          }}
        >
          仅跨租户
        </Button>
      </div>

      <AdminTableSortHint sort={sort} onClearSort={clearSort} scope="page" />

      <AdminPanel className="p-0">
        {query.isLoading ? (
          <AdminTableSkeleton columns={8} showPagination />
        ) : query.isError ? (
          <AdminEmptyState
            message="加载失败，请刷新重试"
            onRetry={() => void query.refetch()}
            isRetrying={query.isFetching}
          />
        ) : !query.data?.logs.length ? (
          hasAuditFilters ? (
            <AdminEmptyState
              message="无匹配审计记录"
              action={
                <Button type="button" variant="outline" size="sm" onClick={clearAuditFilters}>
                  清除筛选
                </Button>
              }
            />
          ) : (
            <AdminEmptyState message="暂无审计记录" />
          )
        ) : (
          <>
            <AdminDataTable>
              <AdminTableHead>
                <tr>
                  <AdminTableSortHeaderCell
                    label="时间"
                    active={sort?.key === 'createdAt'}
                    direction={sort?.key === 'createdAt' ? sort.direction : undefined}
                    onSort={() => toggleSort('createdAt')}
                  />
                  <AdminTableSortHeaderCell
                    label="操作人"
                    active={sort?.key === 'actorEmail'}
                    direction={sort?.key === 'actorEmail' ? sort.direction : undefined}
                    onSort={() => toggleSort('actorEmail')}
                  />
                  <AdminTableSortHeaderCell
                    label="动作"
                    active={sort?.key === 'action'}
                    direction={sort?.key === 'action' ? sort.direction : undefined}
                    onSort={() => toggleSort('action')}
                  />
                  <AdminTableHeaderCell>资源</AdminTableHeaderCell>
                  <AdminTableHeaderCell>详情</AdminTableHeaderCell>
                  <AdminTableHeaderCell>目标租户</AdminTableHeaderCell>
                  <AdminTableHeaderCell>跨租户</AdminTableHeaderCell>
                  <AdminTableHeaderCell className="w-[72px]">操作</AdminTableHeaderCell>
                </tr>
              </AdminTableHead>
              <AdminTableBody>
                {sortedLogs.map((log) => (
                  <AuditLogRow
                    key={log.id}
                    log={log}
                    canReadTenants={canReadTenants}
                    canReadUsers={canReadUsers}
                    onOpenDetail={() => setDetailLog(log)}
                  />
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

      <AuditLogDetailSheet
        log={detailLog}
        open={detailLog != null}
        onOpenChange={(open) => {
          if (!open) setDetailLog(null)
        }}
        canReadTenants={canReadTenants}
        canReadUsers={canReadUsers}
      />
    </div>
  )
}

function AuditLogRow({
  log,
  canReadTenants,
  canReadUsers,
  onOpenDetail,
}: {
  log: AdminAuditLogEntry
  canReadTenants: boolean
  canReadUsers: boolean
  onOpenDetail: () => void
}) {
  const billingLink = buildAuditBillingLink(log.action, log.targetTenantId)
  const usersLink = canReadUsers ? buildAuditUsersLink(log.actorEmail, log.targetTenantId) : null

  return (
    <AdminTableRow>
      <AdminTableCell className="text-muted-foreground">
        {formatAdminDate(log.createdAt)}
      </AdminTableCell>
      <AdminTableCell>
        {log.actorEmail}
        {usersLink ? (
          <Link
            to={usersLink}
            className="ml-2 text-xs text-primary underline-offset-4 hover:underline"
          >
            查用户
          </Link>
        ) : null}
      </AdminTableCell>
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
      <AdminTableCell>
        {log.resourceId ? (
          <div className="space-y-0.5">
            <span className="font-mono text-[10px] text-muted-foreground">{log.resourceType}</span>
            <AdminIdCell value={log.resourceId} label="资源" />
          </div>
        ) : (
          <span className="text-muted-foreground">—</span>
        )}
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
      <AdminTableCell>
        <Button type="button" variant="ghost" size="sm" onClick={onOpenDetail}>
          详情
        </Button>
      </AdminTableCell>
    </AdminTableRow>
  )
}
