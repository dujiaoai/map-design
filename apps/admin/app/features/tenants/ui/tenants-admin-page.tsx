import { Button, toast, useConfirmDialog } from '@repo/ui'
import type { TableColumnsType } from 'antd'
import { useMutation, useQueryClient } from '@tanstack/react-query'
import { EyeIcon, CreditCardIcon, PencilIcon, UsersIcon } from 'lucide-react'
import { useCallback, useMemo, useRef, useState } from 'react'
import { Link } from 'react-router'

import { fetchAdminTenants, patchAdminTenant, type AdminTenantSummary } from '~/shared/api/admin-api'
import { AdminAntTable, adminAntSortOrder, createAdminAntSortHandler } from '~/shared/ant'
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
import { AdminEmptyState, AdminPageHeader, AdminPanel } from '~/shared/ui/admin-page-shell'
import { AdminTableSkeleton } from '~/shared/ui/admin-table-skeleton'
import { AdminTableToolbar } from '~/shared/ui/admin-table-toolbar'
import { AdminStatusBadge, formatAdminDate } from '~/shared/ui/admin-status-badge'
import { AdminTableSortHint } from '~/shared/ui/admin-data-table'

import { CreateTenantSheet } from './create-tenant-sheet'
import { EditTenantSheet } from './edit-tenant-sheet'

type TenantSortKey = 'name' | 'slug' | 'createdAt'

const TENANT_TABLE_COLUMNS = [
  { key: 'name', label: '名称' },
  { key: 'slug', label: 'Slug' },
  { key: 'plan', label: '计划' },
  { key: 'status', label: '状态' },
  { key: 'createdAt', label: '创建时间' },
] as const

export function TenantsAdminPage() {
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
    return filterAdminTableRows(query.data?.tenants, {
      search: '',
      searchKeys: tenantSearchKeys,
      status: statusFilter,
      statusKey: 'status',
    })
  }, [query.data?.tenants, statusFilter])

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

  const toolbarStatus = useMemo(
    () => ({
      search: searchInput,
      status: statusFilter,
      setSearch: setSearchInput,
      setStatus: setStatusFilter,
    }),
    [searchInput, statusFilter, setSearchInput],
  )

  function clearTenantFilters() {
    setSearchInput('')
    setStatusFilter('all')
    setPage(1)
    clearSort()
  }

  const columns = useMemo<TableColumnsType<AdminTenantSummary>>(
    () =>
      [
        {
          title: '名称',
          dataIndex: 'name',
          key: 'name',
          sorter: true,
          sortOrder: adminAntSortOrder(sort, 'name'),
        },
        {
          title: 'Slug',
          dataIndex: 'slug',
          key: 'slug',
          sorter: true,
          sortOrder: adminAntSortOrder(sort, 'slug'),
          render: (slug: string) => <span className="font-mono text-xs">{slug}</span>,
        },
        {
          title: '计划',
          dataIndex: 'plan',
          key: 'plan',
          render: (plan: string) => <span className="font-mono text-xs">{plan}</span>,
        },
        {
          title: '状态',
          dataIndex: 'status',
          key: 'status',
          render: (status: string) => <AdminStatusBadge status={status} />,
        },
        {
          title: '创建时间',
          dataIndex: 'createdAt',
          key: 'createdAt',
          sorter: true,
          sortOrder: adminAntSortOrder(sort, 'createdAt'),
          render: (createdAt: number) => (
            <span className="text-muted-foreground">{formatAdminDate(createdAt)}</span>
          ),
        },
        {
          title: '操作',
          key: 'actions',
          align: 'right',
          render: (_value: unknown, tenant: AdminTenantSummary) => (
            <div className="flex justify-end gap-1">
              <Button
                variant="ghost"
                size="sm"
                nativeButton={false}
                render={<Link to={`/tenants/${tenant.id}`} />}
              >
                <EyeIcon className="size-3.5" />
                详情
              </Button>
              {canReadUsers ? (
                <Button
                  variant="ghost"
                  size="sm"
                  nativeButton={false}
                  render={<Link to={`/users?tenantId=${tenant.id}`} />}
                >
                  <UsersIcon className="size-3.5" />
                  用户
                </Button>
              ) : null}
              {canViewBilling ? (
                <Button
                  variant="ghost"
                  size="sm"
                  nativeButton={false}
                  render={
                    <Link
                      to={`/billing?tab=wallets&tenantId=${encodeURIComponent(tenant.id)}`}
                    />
                  }
                >
                  <CreditCardIcon className="size-3.5" />
                  计费
                </Button>
              ) : null}
              {canWrite ? (
                <Button variant="ghost" size="sm" onClick={() => setEditingTenant(tenant)}>
                  <PencilIcon className="size-3.5" />
                  编辑
                </Button>
              ) : null}
            </div>
          ),
        },
      ].filter((column) => {
        const key = String(column.key)
        if (key === 'actions') return true
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
          '管理平台全部租户；停用后该租户用户无法登录。',
          { total, loaded: Boolean(query.data), unit: '个' },
        )}
        actions={
          canWrite ? (
            <Button onClick={() => setCreateOpen(true)}>新建租户</Button>
          ) : null
        }
      />

      <AdminTableToolbar
        searchInputRef={searchInputRef}
        search={toolbarStatus.search}
        onSearchChange={toolbarStatus.setSearch}
        searchPlaceholder="搜索名称或 slug…"
        status={toolbarStatus.status}
        onStatusChange={toolbarStatus.setStatus}
        statusOptions={[
          { value: 'all', label: '全部状态' },
          { value: 'active', label: 'active' },
          { value: 'suspended', label: 'suspended' },
        ]}
        trailing={
          <AdminTableColumnPicker
            columns={[...TENANT_TABLE_COLUMNS]}
            visible={columnPrefs.visible}
            onVisibleChange={columnPrefs.setColumnVisible}
            onReset={columnPrefs.resetColumns}
          />
        }
      />

      <AdminTableSortHint sort={sort} onClearSort={clearSort} scope="server" />

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

      <AdminPanel className="p-0">
        {query.isLoading ? (
          <AdminTableSkeleton columns={6} showPagination />
        ) : query.isError ? (
          <AdminEmptyState
            message="加载失败，请刷新重试"
            onRetry={() => void query.refetch()}
            isRetrying={query.isFetching}
          />
        ) : !query.data?.tenants.length ? (
          <AdminEmptyState message="暂无租户" />
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
            rowKey="id"
            columns={columns}
            dataSource={filteredTenants}
            onChange={createAdminAntSortHandler(handleToggleSort)}
            showSorterTooltip={false}
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
