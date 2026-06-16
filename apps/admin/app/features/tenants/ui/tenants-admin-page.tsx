import { Button } from '@repo/ui'
import type { TableColumnsType } from 'antd'
import { EyeIcon, CreditCardIcon, PencilIcon, UsersIcon } from 'lucide-react'
import { useMemo, useRef, useState } from 'react'
import { Link } from 'react-router'

import { fetchAdminTenants, type AdminTenantSummary } from '~/shared/api/admin-api'
import { AdminAntTable, adminAntSortOrder, createAdminAntSortHandler } from '~/shared/ant'
import { useAdminPagedListState, useAdminPagedQuery } from '~/shared/hooks/use-admin-paged-list'
import { useAdminListSearchShortcut } from '~/shared/hooks/use-admin-list-search-shortcut'
import { filterAdminTableRows } from '~/shared/hooks/use-admin-table-filter'
import { sortAdminTableRows, useAdminTableSort } from '~/shared/hooks/use-admin-table-sort'
import { useAdminPermissions } from '~/shared/hooks/use-admin-permissions'
import { adminQueryKeys } from '~/shared/lib/admin-query-keys'
import { appendAdminListTotal } from '~/shared/lib/format-admin-list-description'
import { AdminEmptyState, AdminPageHeader, AdminPanel } from '~/shared/ui/admin-page-shell'
import { AdminTableSkeleton } from '~/shared/ui/admin-table-skeleton'
import { AdminTableToolbar } from '~/shared/ui/admin-table-toolbar'
import { AdminStatusBadge, formatAdminDate } from '~/shared/ui/admin-status-badge'
import { AdminTableSortHint } from '~/shared/ui/admin-data-table'

import { CreateTenantSheet } from './create-tenant-sheet'
import { EditTenantSheet } from './edit-tenant-sheet'

type TenantSortKey = 'name' | 'slug' | 'createdAt'

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
  const [statusFilter, setStatusFilter] = useState('all')
  const searchInputRef = useRef<HTMLInputElement>(null)

  const { searchInput, setSearchInput, page, setPage, queryParams } = useAdminPagedListState()
  useAdminListSearchShortcut(searchInputRef)
  const { sort, toggleSort, clearSort } = useAdminTableSort<TenantSortKey>()

  const query = useAdminPagedQuery({
    queryKey: adminQueryKeys.tenants(queryParams),
    queryFn: () => fetchAdminTenants(queryParams),
  })

  const tenantSearchKeys: (keyof AdminTenantSummary)[] = ['name', 'slug', 'plan']
  const filteredTenants = useMemo(() => {
    const filtered = filterAdminTableRows(query.data?.tenants, {
      search: '',
      searchKeys: tenantSearchKeys,
      status: statusFilter,
      statusKey: 'status',
    })
    return sortAdminTableRows(filtered, sort, {
      name: (tenant) => tenant.name.toLowerCase(),
      slug: (tenant) => tenant.slug.toLowerCase(),
      createdAt: (tenant) => tenant.createdAt,
    })
  }, [query.data?.tenants, statusFilter, sort])

  const total = query.data?.total ?? query.data?.tenants.length ?? 0

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
    () => [
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
    ],
    [canReadUsers, canViewBilling, canWrite, sort],
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
      />

      <AdminTableSortHint sort={sort} onClearSort={clearSort} scope="page" />

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
            onChange={createAdminAntSortHandler(toggleSort)}
            showSorterTooltip={false}
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
    </div>
  )
}
