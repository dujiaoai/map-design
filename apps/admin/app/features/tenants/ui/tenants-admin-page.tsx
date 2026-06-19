import { Badge, Button, toast, useConfirmDialog, Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@repo/ui'
import type { TableColumnsType } from 'antd'
import { useMutation, useQueryClient } from '@tanstack/react-query'
import { CreditCardIcon, EyeIcon, PencilIcon, PlusIcon, UsersIcon } from 'lucide-react'
import { useCallback, useMemo, useRef, useState } from 'react'
import { Link, useNavigate } from 'react-router'

import type { TenantOnboardingPhase } from '~/entities/tenant/model'
import {
  formatTenantTrialEndsAt,
  resolveOnboardingPhase,
  TENANT_ONBOARDING_LABELS,
  tenantTrialLabel,
} from '~/features/tenants/lib/tenant-lifecycle'
import { CreateTenantSheet } from '~/features/tenants/ui/create-tenant-sheet'
import { EditTenantSheet } from '~/features/tenants/ui/edit-tenant-sheet'
import { TenantNameCell } from '~/features/tenants/ui/tenant-name-cell'
import { TenantRowAction, TenantRowActions } from '~/features/tenants/ui/tenant-row-actions'
import { TenantsFilterBar } from '~/features/tenants/ui/tenants-filter-bar'
import { TenantsOverviewStrip } from '~/features/tenants/ui/tenants-overview-strip'
import { fetchAdminTenants, patchAdminTenant, type AdminTenantSummary } from '~/shared/api/admin-api'
import { AdminAntTable, ADMIN_LIST_TABLE_BODY_HEIGHT, adminAntSortOrder, createAdminAntSortHandler } from '~/shared/ant'
import { useAdminPagedListState, useAdminPagedQuery } from '~/shared/hooks/use-admin-paged-list'
import { useAdminListSearchShortcut } from '~/shared/hooks/use-admin-list-search-shortcut'
import { filterAdminTableRows } from '~/shared/hooks/use-admin-table-filter'
import { useAdminTableColumnPrefs } from '~/shared/hooks/use-admin-table-column-prefs'
import { useAdminTableSort } from '~/shared/hooks/use-admin-table-sort'
import { useAdminPermissions } from '~/shared/hooks/use-admin-permissions'
import { adminQueryKeys } from '~/shared/lib/admin-query-keys'
import { appendAdminListTotal } from '~/shared/lib/format-admin-list-description'
import { AdminTableBulkBar } from '~/shared/ui/admin-table-bulk-bar'
import { AdminTableColumnPicker } from '~/shared/ui/admin-table-column-picker'
import { AdminEmptyState, AdminPageHeader, AdminPanel, AdminPanelHeader } from '~/shared/ui/admin-page-shell'
import { AdminTableSkeleton } from '~/shared/ui/admin-table-skeleton'
import { AdminTableToolbar } from '~/shared/ui/admin-table-toolbar'
import { AdminStatusBadge, formatAdminDate } from '~/shared/ui/admin-status-badge'
import { AdminStatusPill } from '~/shared/ui/admin-status-pill'
import { AdminTableSortHint } from '~/shared/ui/admin-data-table'

type TenantSortKey = 'name' | 'slug' | 'createdAt'

const TENANT_TABLE_COLUMNS = [
  { key: 'name', label: '名称' },
  { key: 'slug', label: 'Slug' },
  { key: 'plan', label: '计划' },
  { key: 'trialEndsAt', label: '试用截止' },
  { key: 'onboardingPhase', label: '生命周期' },
  { key: 'status', label: '状态' },
  { key: 'createdAt', label: '创建时间' },
] as const

const TENANT_TABLE_SCROLL_X = 1180

export function TenantsAdminPage() {
  const navigate = useNavigate()
  const { can, canAny } = useAdminPermissions()
  const canWrite = can('admin:tenants:write')
  const canReadUsers = can('admin:users:read')
  const canViewBilling = canAny([
    'admin:billing:read',
    'admin:billing:adjust',
    'admin:billing:packages:write',
    'admin:billing:refund',
  ])

  const [createOpen, setCreateOpen] = useState(false)
  const [editingTenant, setEditingTenant] = useState<AdminTenantSummary | null>(null)
  const [selectedRowKeys, setSelectedRowKeys] = useState<string[]>([])
  const [statusFilter, setStatusFilter] = useState('all')
  const [onboardingFilter, setOnboardingFilter] = useState('all')
  const searchInputRef = useRef<HTMLInputElement>(null)
  const queryClient = useQueryClient()
  const { confirm, confirmDialog } = useConfirmDialog()
  const columnPrefs = useAdminTableColumnPrefs('tenants', [...TENANT_TABLE_COLUMNS])

  const { searchInput, setSearchInput, page, setPage, queryParams: baseQueryParams } =
    useAdminPagedListState()
  useAdminListSearchShortcut(searchInputRef)
  const { sort, toggleSort, clearSort } = useAdminTableSort<TenantSortKey>()

  const handleToggleSort = useCallback(
    (key: TenantSortKey) => {
      toggleSort(key)
      setPage(1)
    },
    [toggleSort, setPage],
  )

  const queryParams = useMemo(
    () => ({
      ...baseQueryParams,
      ...(sort ? { sortBy: sort.key, sortDir: sort.direction } : {}),
    }),
    [baseQueryParams, sort],
  )

  const query = useAdminPagedQuery({
    queryKey: adminQueryKeys.tenants(queryParams),
    queryFn: () => fetchAdminTenants(queryParams),
  })

  const tenantSearchKeys: (keyof AdminTenantSummary)[] = ['name', 'slug', 'plan']
  const filteredTenants = useMemo(() => {
    const rows = filterAdminTableRows(query.data?.tenants, {
      search: searchInput,
      searchKeys: tenantSearchKeys,
      status: statusFilter,
      statusKey: 'status',
    })
    if (onboardingFilter === 'all') return rows
    return rows.filter((tenant) => resolveOnboardingPhase(tenant) === onboardingFilter)
  }, [query.data?.tenants, searchInput, statusFilter, onboardingFilter])

  const total = query.data?.total ?? query.data?.tenants.length ?? 0

  const selectedTenants = useMemo(
    () => filteredTenants.filter((tenant) => selectedRowKeys.includes(tenant.id)),
    [filteredTenants, selectedRowKeys],
  )

  const suspendableSelectedTenants = useMemo(
    () => selectedTenants.filter((tenant) => tenant.status !== 'suspended'),
    [selectedTenants],
  )

  const bulkSuspendMutation = useMutation({
    mutationFn: async (tenantIds: string[]) => {
      await Promise.all(
        tenantIds.map((tenantId) => patchAdminTenant(tenantId, { status: 'suspended' })),
      )
    },
    onSuccess: async (_data, tenantIds) => {
      await queryClient.invalidateQueries({ queryKey: ['admin', 'tenants'] })
      await queryClient.invalidateQueries({ queryKey: adminQueryKeys.stats })
      setSelectedRowKeys([])
      toast.success(`已停用 ${tenantIds.length} 个租户`)
    },
    onError: () => {
      toast.error('批量停用失败，请稍后重试')
    },
  })

  async function handleBulkSuspend() {
    if (suspendableSelectedTenants.length === 0) return
    const confirmed = await confirm({
      description: `确定停用已选的 ${suspendableSelectedTenants.length} 个租户？停用后该租户用户无法登录。`,
      confirmLabel: '批量停用',
      destructive: true,
    })
    if (!confirmed) return
    bulkSuspendMutation.mutate(suspendableSelectedTenants.map((tenant) => tenant.id))
  }

  function clearTenantFilters() {
    setSearchInput('')
    setStatusFilter('all')
    setOnboardingFilter('all')
    setPage(1)
    clearSort()
  }

  function handlePhaseClick(phase: TenantOnboardingPhase | 'all') {
    setOnboardingFilter(phase)
    setPage(1)
  }

  const columns = useMemo<TableColumnsType<AdminTenantSummary>>(
    () =>
      [
        {
          title: '名称',
          dataIndex: 'name',
          key: 'name',
          width: 220,
          sorter: true,
          sortOrder: adminAntSortOrder(sort, 'name'),
          render: (_name: string, tenant: AdminTenantSummary) => (
            <TenantNameCell tenant={tenant} />
          ),
        },
        {
          title: 'Slug',
          dataIndex: 'slug',
          key: 'slug',
          width: 128,
          sorter: true,
          sortOrder: adminAntSortOrder(sort, 'slug'),
          render: (slug: string) => <span className="font-mono text-xs text-muted-foreground">{slug}</span>,
        },
        {
          title: '计划',
          dataIndex: 'plan',
          key: 'plan',
          width: 148,
          render: (plan: string, tenant: AdminTenantSummary) => (
            <span className="inline-flex flex-wrap items-center gap-1.5">
              <Badge variant="outline" className="font-mono text-[11px] font-normal">
                {plan}
              </Badge>
              {(() => {
                const label = tenantTrialLabel(tenant.trialEndsAt)
                if (!label) return null
                return (
                  <AdminStatusPill
                    level={label === '试用已到期' ? 'warn' : 'info'}
                    label={label}
                  />
                )
              })()}
            </span>
          ),
        },
        {
          title: '试用截止',
          dataIndex: 'trialEndsAt',
          key: 'trialEndsAt',
          width: 116,
          render: (trialEndsAt: number | null | undefined) => (
            <span className="text-muted-foreground">{formatTenantTrialEndsAt(trialEndsAt)}</span>
          ),
        },
        {
          title: '生命周期',
          key: 'onboardingPhase',
          width: 108,
          render: (_value: unknown, tenant: AdminTenantSummary) => {
            const phase = resolveOnboardingPhase(tenant)
            return (
              <AdminStatusPill
                level={
                  phase === 'suspended' || phase === 'trial_expired'
                    ? 'warn'
                    : phase === 'trial'
                      ? 'info'
                      : 'ok'
                }
                label={TENANT_ONBOARDING_LABELS[phase]}
              />
            )
          },
        },
        {
          title: '状态',
          dataIndex: 'status',
          key: 'status',
          width: 96,
          render: (status: string) => <AdminStatusBadge status={status} />,
        },
        {
          title: '创建时间',
          dataIndex: 'createdAt',
          key: 'createdAt',
          width: 124,
          sorter: true,
          sortOrder: adminAntSortOrder(sort, 'createdAt'),
          render: (createdAt: number) => (
            <span className="text-muted-foreground">{formatAdminDate(createdAt)}</span>
          ),
        },
        {
          title: '操作',
          key: 'actions',
          align: 'right' as const,
          fixed: 'right' as const,
          width: 168,
          render: (_value: unknown, tenant: AdminTenantSummary) => (
            <TenantRowActions>
              <TenantRowAction
                label="查看详情"
                icon={EyeIcon}
                render={<Link to={`/tenants/${tenant.id}`} />}
              />
              {canReadUsers ? (
                <TenantRowAction
                  label="查看用户"
                  icon={UsersIcon}
                  render={<Link to={`/users?tenantId=${tenant.id}`} />}
                />
              ) : null}
              {canViewBilling ? (
                <TenantRowAction
                  label="计费"
                  icon={CreditCardIcon}
                  render={
                    <Link
                      to={`/billing?tab=wallets&tenantId=${encodeURIComponent(tenant.id)}`}
                    />
                  }
                />
              ) : null}
              {canWrite ? (
                <TenantRowAction
                  label="编辑租户"
                  icon={PencilIcon}
                  onClick={() => setEditingTenant(tenant)}
                />
              ) : null}
            </TenantRowActions>
          ),
        },
      ].filter((column) => {
        const key = String(column.key)
        if (key === 'actions' || key === 'name') return true
        return columnPrefs.isColumnVisible(key)
      }),
    [canReadUsers, canViewBilling, canWrite, columnPrefs.isColumnVisible, columnPrefs.visible, sort],
  )

  return (
    <div className="space-y-6 admin-stagger">
      <AdminPageHeader
        eyebrow="Tenants"
        title="租户"
        description={appendAdminListTotal(
          '管理平台全部租户的组织档案、生命周期与快捷运维入口。',
          { total, loaded: Boolean(query.data), unit: '个' },
        )}
        actions={
          canWrite ? (
            <Button onClick={() => setCreateOpen(true)}>
              <PlusIcon className="size-4" />
              新建租户
            </Button>
          ) : null
        }
      />

      <TenantsOverviewStrip
        activePhase={onboardingFilter}
        onPhaseClick={handlePhaseClick}
      />

      <AdminPanel>
        <AdminPanelHeader title="筛选与列表" description="支持 / 聚焦搜索、状态与生命周期筛选" />
        <div className="space-y-3 border-b border-border/50 px-4 py-4 md:px-5">
          <AdminTableToolbar
            searchInputRef={searchInputRef}
            search={searchInput}
            onSearchChange={setSearchInput}
            searchPlaceholder="搜索名称、slug 或计划…"
            status={statusFilter}
            onStatusChange={setStatusFilter}
            statusOptions={[
              { value: 'all', label: '全部状态' },
              { value: 'active', label: '正常' },
              { value: 'suspended', label: '已停用' },
            ]}
            trailing={
              <>
                <Select
                  value={onboardingFilter}
                  onValueChange={(value) => {
                    setOnboardingFilter(value ?? 'all')
                    setPage(1)
                  }}
                >
                  <SelectTrigger className="w-[148px]">
                    <SelectValue placeholder="生命周期" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">全部生命周期</SelectItem>
                    <SelectItem value="active">正式</SelectItem>
                    <SelectItem value="trial">试用中</SelectItem>
                    <SelectItem value="trial_expired">试用到期</SelectItem>
                    <SelectItem value="suspended">已停用</SelectItem>
                  </SelectContent>
                </Select>
                <AdminTableColumnPicker
                  columns={[...TENANT_TABLE_COLUMNS]}
                  visible={columnPrefs.visible}
                  onVisibleChange={columnPrefs.setColumnVisible}
                  onReset={columnPrefs.resetColumns}
                />
              </>
            }
          />
          <TenantsFilterBar
            search={searchInput}
            status={statusFilter}
            onboarding={onboardingFilter}
            onClearAll={clearTenantFilters}
          />
          <AdminTableSortHint sort={sort} onClearSort={clearSort} scope="server" />
        </div>

        {canWrite ? (
          <AdminTableBulkBar
            selectedCount={selectedRowKeys.length}
            onClearSelection={() => setSelectedRowKeys([])}
          >
            <Button
              type="button"
              variant="destructive"
              size="sm"
              disabled={
                suspendableSelectedTenants.length === 0 || bulkSuspendMutation.isPending
              }
              onClick={() => void handleBulkSuspend()}
            >
              {bulkSuspendMutation.isPending ? '处理中…' : '批量停用'}
            </Button>
          </AdminTableBulkBar>
        ) : null}

        {query.isLoading ? (
          <AdminTableSkeleton columns={6} showPagination />
        ) : query.isError ? (
          <AdminEmptyState
            message="加载失败，请刷新重试"
            onRetry={() => void query.refetch()}
            isRetrying={query.isFetching}
          />
        ) : !query.data?.tenants.length ? (
          <AdminEmptyState
            message="暂无租户"
            action={
              canWrite ? (
                <Button type="button" size="sm" onClick={() => setCreateOpen(true)}>
                  <PlusIcon className="size-4" />
                  新建租户
                </Button>
              ) : undefined
            }
          />
        ) : !filteredTenants.length ? (
          <AdminEmptyState
            message="无匹配租户"
            action={
              <Button type="button" variant="outline" size="sm" onClick={clearTenantFilters}>
                清除筛选
              </Button>
            }
          />
        ) : (
          <AdminAntTable<AdminTenantSummary>
            className="admin-tenants-table"
            bodyHeight={ADMIN_LIST_TABLE_BODY_HEIGHT}
            scroll={{ x: TENANT_TABLE_SCROLL_X }}
            rowKey="id"
            columns={columns}
            dataSource={filteredTenants}
            onChange={createAdminAntSortHandler(handleToggleSort)}
            showSorterTooltip={false}
            onRow={(tenant) => ({
              className: 'admin-tenant-row cursor-pointer',
              onDoubleClick: () => navigate(`/tenants/${tenant.id}`),
            })}
            rowSelection={
              canWrite
                ? {
                    selectedRowKeys,
                    onChange: (keys) => setSelectedRowKeys(keys.map(String)),
                    getCheckboxProps: (tenant) => ({
                      disabled: tenant.status === 'suspended',
                    }),
                  }
                : undefined
            }
            pagination={{
              current: page,
              pageSize: queryParams.size,
              total,
              onChange: setPage,
            }}
          />
        )}
      </AdminPanel>

      <CreateTenantSheet open={createOpen} onOpenChange={setCreateOpen} />
      <EditTenantSheet
        tenant={editingTenant}
        open={Boolean(editingTenant)}
        onOpenChange={(open) => {
          if (!open) setEditingTenant(null)
        }}
      />

      {confirmDialog}
    </div>
  )
}
