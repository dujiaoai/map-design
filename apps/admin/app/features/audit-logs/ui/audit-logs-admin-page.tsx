import { Badge, Button, Input, Label, Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@repo/ui'
import type { TableColumnsType } from 'antd'
import { CreditCardIcon, DownloadIcon } from 'lucide-react'
import { useCallback, useMemo, useRef, useState } from 'react'
import { Link, useSearchParams } from 'react-router'
import { toast } from 'sonner'

import { AUDIT_ACTION_OPTIONS } from '~/features/audit-logs/lib/audit-log-actions'
import { downloadAdminAuditLogsCsv } from '~/features/audit-logs/lib/audit-log-export'
import { buildAuditBillingLink } from '~/features/audit-logs/lib/audit-log-billing-nav'
import {
  dateInputToFromEpoch,
  dateInputToToEpoch,
} from '~/features/audit-logs/lib/audit-log-date-range'
import { AUDIT_EXPORT_PERMISSIONS } from '~/features/audit-logs/lib/audit-log-permissions'
import { buildAuditUsersLink } from '~/features/audit-logs/lib/audit-log-users-nav'
import { AuditLogDetailSheet } from '~/features/audit-logs/ui/audit-log-detail-sheet'
import {
  AdminAntDateRange,
  AdminAntTable,
  adminAntSortOrder,
  createAdminAntSortHandler,
} from '~/shared/ant'
import { fetchAdminAuditLogs, fetchAdminTenants, type AdminAuditLogEntry } from '~/shared/api/admin-api'
import { useAdminPermissions } from '~/shared/hooks/use-admin-permissions'
import { useAdminPagedListState, useAdminPagedQuery } from '~/shared/hooks/use-admin-paged-list'
import { useAdminListSearchShortcut } from '~/shared/hooks/use-admin-list-search-shortcut'
import { useAdminTableSort } from '~/shared/hooks/use-admin-table-sort'
import { adminQueryKeys } from '~/shared/lib/admin-query-keys'
import { appendAdminListTotal } from '~/shared/lib/format-admin-list-description'
import { AdminTableSortHint } from '~/shared/ui/admin-data-table'
import { AdminEmptyState, AdminPageHeader, AdminPanel } from '~/shared/ui/admin-page-shell'
import { AdminIdCell } from '~/shared/ui/admin-id-cell'
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
  const canExportAudit = canAny([...AUDIT_EXPORT_PERMISSIONS])
  const canReadUsers = can('admin:users:read')
  const canReadTenants = can('admin:tenants:read')
  const [searchParams, setSearchParams] = useSearchParams()
  const tenantFilterId = searchParams.get('tenantId') ?? undefined
  const actorFilterId = searchParams.get('actorUserId') ?? undefined

  const { searchInput, setSearchInput, page, setPage, queryParams: baseQueryParams } =
    useAdminPagedListState()
  const searchInputRef = useRef<HTMLInputElement>(null)
  useAdminListSearchShortcut(searchInputRef)
  const { sort, toggleSort, clearSort } = useAdminTableSort<AuditSortKey>()

  const handleToggleSort = useCallback(
    (key: AuditSortKey) => {
      toggleSort(key)
      setPage(1)
    },
    [toggleSort, setPage],
  )
  const [actionFilter, setActionFilter] = useState<string>('all')
  const [crossTenantOnly, setCrossTenantOnly] = useState(false)
  const [fromDate, setFromDate] = useState('')
  const [toDate, setToDate] = useState('')
  const [detailLog, setDetailLog] = useState<AdminAuditLogEntry | null>(null)
  const [exporting, setExporting] = useState(false)

  const fromEpoch = dateInputToFromEpoch(fromDate)
  const toEpoch = dateInputToToEpoch(toDate)

  const listQuery = useMemo(
    () => ({
      ...baseQueryParams,
      action: actionFilter === 'all' ? undefined : actionFilter,
      crossTenant: crossTenantOnly ? true : undefined,
      tenantId: tenantFilterId,
      from: fromEpoch,
      to: toEpoch,
      actorUserId: actorFilterId,
      ...(sort ? { sortBy: sort.key, sortDir: sort.direction } : {}),
    }),
    [
      baseQueryParams,
      actionFilter,
      crossTenantOnly,
      tenantFilterId,
      fromEpoch,
      toEpoch,
      actorFilterId,
      sort,
    ],
  )

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
    Boolean(actorFilterId) ||
    fromDate.length > 0 ||
    toDate.length > 0

  const logs = query.data?.logs ?? []

  async function handleExportCsv() {
    setExporting(true)
    try {
      await downloadAdminAuditLogsCsv(listQuery)
      toast.success('审计日志 CSV 已开始下载')
    } catch {
      toast.error('导出失败，请稍后重试')
    } finally {
      setExporting(false)
    }
  }

  const columns = useMemo<TableColumnsType<AdminAuditLogEntry>>(
    () => [
      {
        title: '时间',
        dataIndex: 'createdAt',
        key: 'createdAt',
        sorter: true,
        sortOrder: adminAntSortOrder(sort, 'createdAt'),
        render: (createdAt: number) => (
          <span className="text-muted-foreground">{formatAdminDate(createdAt)}</span>
        ),
      },
      {
        title: '操作人',
        dataIndex: 'actorEmail',
        key: 'actorEmail',
        sorter: true,
        sortOrder: adminAntSortOrder(sort, 'actorEmail'),
        render: (actorEmail: string, log: AdminAuditLogEntry) => {
          const usersLink = canReadUsers
            ? buildAuditUsersLink(log.actorEmail, log.targetTenantId)
            : null
          return (
            <>
              {actorEmail}
              {usersLink ? (
                <Link
                  to={usersLink}
                  className="ml-2 text-xs text-primary underline-offset-4 hover:underline"
                >
                  查用户
                </Link>
              ) : null}
            </>
          )
        },
      },
      {
        title: '动作',
        dataIndex: 'action',
        key: 'action',
        sorter: true,
        sortOrder: adminAntSortOrder(sort, 'action'),
        render: (action: string, log: AdminAuditLogEntry) => {
          const billingLink = buildAuditBillingLink(log.action, log.targetTenantId)
          return (
            <>
              <span className="font-mono text-xs">{action}</span>
              {billingLink ? (
                <Link
                  to={billingLink}
                  className="ml-2 text-xs text-primary underline-offset-4 hover:underline"
                >
                  查看计费
                </Link>
              ) : null}
            </>
          )
        },
      },
      {
        title: '资源',
        key: 'resource',
        render: (_value: unknown, log: AdminAuditLogEntry) =>
          log.resourceId ? (
            <div className="space-y-0.5">
              <span className="font-mono text-[10px] text-muted-foreground">{log.resourceType}</span>
              <AdminIdCell value={log.resourceId} label="资源" />
            </div>
          ) : (
            <span className="text-muted-foreground">—</span>
          ),
      },
      {
        title: '详情',
        dataIndex: 'detail',
        key: 'detail',
        ellipsis: true,
        render: (detail: string | null) => detail ?? '—',
      },
      {
        title: '目标租户',
        key: 'targetTenant',
        render: (_value: unknown, log: AdminAuditLogEntry) =>
          log.targetTenantId ? (
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
          ),
      },
      {
        title: '跨租户',
        dataIndex: 'crossTenant',
        key: 'crossTenant',
        render: (crossTenant: boolean) =>
          crossTenant ? (
            <Badge variant="outline" className="font-mono text-[10px]">
              cross
            </Badge>
          ) : (
            <span className="text-muted-foreground">—</span>
          ),
      },
      {
        title: '操作',
        key: 'actions',
        width: 72,
        render: (_value: unknown, log: AdminAuditLogEntry) => (
          <Button type="button" variant="ghost" size="sm" onClick={() => setDetailLog(log)}>
            详情
          </Button>
        ),
      },
    ],
    [canReadTenants, canReadUsers, sort],
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
          <>
            {canExportAudit ? (
              <Button
                type="button"
                variant="outline"
                size="sm"
                disabled={exporting}
                onClick={() => void handleExportCsv()}
              >
                <DownloadIcon className="size-3.5" />
                导出 CSV
              </Button>
            ) : null}
            {canViewBilling ? (
              <Button
                nativeButton={false}
                variant="outline"
                size="sm"
                render={<Link to="/billing" />}
              >
                <CreditCardIcon className="size-3.5" />
                计费运营
              </Button>
            ) : null}
          </>
        }
      />

      {tenantFilterId ? (
        <AdminTenantContextBanner
          tenantId={tenantFilterId}
          tenantLabel={tenantLabel}
          showUsersLink
          onClear={() => {
            const next = new URLSearchParams(searchParams)
            next.delete('tenantId')
            setSearchParams(next)
          }}
        />
      ) : null}

      {actorFilterId ? (
        <AdminPanel className="flex flex-wrap items-center justify-between gap-3 border-primary/20 bg-primary/5 px-4 py-3 md:px-5">
          <div className="text-sm">
            <span className="text-muted-foreground">操作人筛选 · </span>
            <AdminIdCell value={actorFilterId} label="用户" />
          </div>
          <Button
            type="button"
            variant="ghost"
            size="sm"
            onClick={() => {
              const next = new URLSearchParams(searchParams)
              next.delete('actorUserId')
              setSearchParams(next)
              setPage(1)
            }}
          >
            清除操作人
          </Button>
        </AdminPanel>
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
        <AdminAntDateRange
          id="audit-date-range"
          fromDate={fromDate}
          toDate={toDate}
          aria-label="审计日志日期范围"
          onChange={(from, to) => {
            setFromDate(from)
            setToDate(to)
            setPage(1)
          }}
        />
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

      <AdminTableSortHint sort={sort} onClearSort={clearSort} scope="server" />

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
          <AdminAntTable<AdminAuditLogEntry>
            rowKey="id"
            columns={columns}
            dataSource={logs}
            onChange={createAdminAntSortHandler(handleToggleSort)}
            showSorterTooltip={false}
            pagination={{
              current: page,
              pageSize: baseQueryParams.size,
              total,
              onChange: setPage,
            }}
          />
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
