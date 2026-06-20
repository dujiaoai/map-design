import { Badge, Button, Select, SelectContent, SelectItem, SelectTrigger, SelectValue, toast, useConfirmDialog } from '@repo/ui'
import type { TableColumnsType } from 'antd'
import { useMutation, useQueryClient } from '@tanstack/react-query'
import { ArrowLeftIcon, PencilIcon, ScrollTextIcon, UserPlusIcon } from 'lucide-react'
import { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import { Link, useSearchParams } from 'react-router'

import { AUDIT_READ_PERMISSIONS } from '~/features/audit-logs/lib/audit-log-permissions'
import { buildAuditLogsLink } from '~/features/audit-logs/lib/audit-log-nav'
import { TenantRowAction, TenantRowActions } from '~/features/tenants/ui/tenant-row-actions'
import { formatUserRoleLabel } from '~/features/users/lib/user-role-labels'
import { EditUserSheet } from '~/features/users/ui/edit-user-sheet'
import { UserNameCell } from '~/features/users/ui/user-name-cell'
import { UsersGuidanceStrip } from '~/features/users/ui/users-guidance-strip'
import { UsersStatusFilter } from '~/features/users/ui/users-status-filter'
import { fetchAdminTenants, fetchAdminUsers, patchAdminUser, type AdminUserSummary } from '~/shared/api/admin-api'
import { AdminAntTable, ADMIN_LIST_TABLE_BODY_HEIGHT, adminAntSortOrder, createAdminAntSortHandler } from '~/shared/ant'
import { useAdminPagedListState, useAdminPagedQuery } from '~/shared/hooks/use-admin-paged-list'
import { useAdminListSearchShortcut } from '~/shared/hooks/use-admin-list-search-shortcut'
import { filterAdminTableRows } from '~/shared/hooks/use-admin-table-filter'
import { useAdminTableColumnPrefs } from '~/shared/hooks/use-admin-table-column-prefs'
import { useAdminTableSort } from '~/shared/hooks/use-admin-table-sort'
import { useAdminPermissions } from '~/shared/hooks/use-admin-permissions'
import { adminQueryKeys } from '~/shared/lib/admin-query-keys'
import { AdminTableSortHint } from '~/shared/ui/admin-data-table'
import { AdminTableBulkBar } from '~/shared/ui/admin-table-bulk-bar'
import { AdminEmptyState, AdminPanel } from '~/shared/ui/admin-page-shell'
import { AdminTenantContextBanner } from '~/shared/ui/admin-tenant-context-banner'
import { AdminTableSkeleton } from '~/shared/ui/admin-table-skeleton'
import { AdminTableColumnPicker } from '~/shared/ui/admin-table-column-picker'
import { AdminTableToolbar } from '~/shared/ui/admin-table-toolbar'
import { AdminStatusBadge, formatAdminDate } from '~/shared/ui/admin-status-badge'

type UserSortKey = 'email' | 'displayName' | 'tenantSlug' | 'lastLoginAt' | 'createdAt'

const USER_TABLE_COLUMNS = [
  { key: 'user', label: '用户' },
  { key: 'tenantSlug', label: '租户' },
  { key: 'roles', label: '角色' },
  { key: 'status', label: '状态' },
  { key: 'lastLoginAt', label: '最近登录' },
  { key: 'createdAt', label: '创建时间' },
] as const

export function UsersAdminPage() {
  const { can, canAny } = useAdminPermissions()
  const canWrite = can('admin:users:write')
  const canReadTenants = can('admin:tenants:read')
  const canViewAudit = canAny([...AUDIT_READ_PERMISSIONS])
  const [searchParams, setSearchParams] = useSearchParams()
  const tenantFilterId = searchParams.get('tenantId') ?? undefined
  const qFromUrl = searchParams.get('q') ?? ''

  const [editingUser, setEditingUser] = useState<AdminUserSummary | null>(null)
  const [selectedRowKeys, setSelectedRowKeys] = useState<string[]>([])
  const [statusFilter, setStatusFilter] = useState('all')
  const searchInputRef = useRef<HTMLInputElement>(null)
  const queryClient = useQueryClient()
  const { confirm, confirmDialog } = useConfirmDialog()
  const columnPrefs = useAdminTableColumnPrefs('users', [...USER_TABLE_COLUMNS])

  const { searchInput, setSearchInput, page, setPage, queryParams: baseQueryParams } =
    useAdminPagedListState(qFromUrl)

  useAdminListSearchShortcut(searchInputRef)
  const { sort, toggleSort, clearSort } = useAdminTableSort<UserSortKey>()

  const handleToggleSort = useCallback(
    (key: UserSortKey) => {
      toggleSort(key)
      setPage(1)
    },
    [toggleSort, setPage],
  )

  const listParams = useMemo(
    () => ({
      ...baseQueryParams,
      status: statusFilter === 'all' ? undefined : (statusFilter as 'active' | 'disabled' | 'invited'),
      ...(sort ? { sortBy: sort.key, sortDir: sort.direction } : {}),
    }),
    [baseQueryParams, statusFilter, sort],
  )

  useEffect(() => {
    setSearchInput(qFromUrl)
  }, [qFromUrl, setSearchInput])

  const tenantsQuery = useAdminPagedQuery({
    queryKey: adminQueryKeys.tenantsAll,
    queryFn: () => fetchAdminTenants(),
  })

  const usersQuery = useAdminPagedQuery({
    queryKey: adminQueryKeys.users(tenantFilterId, listParams),
    queryFn: () => fetchAdminUsers(tenantFilterId, listParams),
  })

  const tenantLabel = useMemo(() => {
    if (!tenantFilterId) return '全部租户'
    const tenant = tenantsQuery.data?.tenants.find((item) => item.id === tenantFilterId)
    return tenant ? `${tenant.name} (${tenant.slug})` : tenantFilterId
  }, [tenantFilterId, tenantsQuery.data?.tenants])

  const backLink =
    tenantFilterId && canReadTenants
      ? { to: `/tenants/${tenantFilterId}?tab=info`, label: '返回租户' }
      : { to: '/', label: '返回概览' }

  const userSearchKeys: (keyof AdminUserSummary)[] = ['email', 'displayName', 'tenantSlug']
  const filteredUsers = useMemo(() => {
    return filterAdminTableRows(usersQuery.data?.users, {
      search: '',
      searchKeys: userSearchKeys,
    })
  }, [usersQuery.data?.users])

  const total = usersQuery.data?.total ?? usersQuery.data?.users.length ?? 0
  const showActions = canWrite || canViewAudit

  const hasUserFilters =
    searchInput.trim().length > 0 ||
    statusFilter !== 'all' ||
    Boolean(sort) ||
    Boolean(tenantFilterId) ||
    Boolean(qFromUrl)

  const selectedUsers = useMemo(
    () => filteredUsers.filter((user) => selectedRowKeys.includes(user.id)),
    [filteredUsers, selectedRowKeys],
  )

  const disableableSelectedUsers = useMemo(
    () => selectedUsers.filter((user) => user.status !== 'disabled'),
    [selectedUsers],
  )

  const bulkDisableMutation = useMutation({
    mutationFn: async (userIds: string[]) => {
      await Promise.all(userIds.map((userId) => patchAdminUser(userId, { status: 'disabled' })))
    },
    onSuccess: async (_data, userIds) => {
      await queryClient.invalidateQueries({ queryKey: ['admin', 'users'] })
      setSelectedRowKeys([])
      toast.success(`已禁用 ${userIds.length} 个用户`)
    },
    onError: () => {
      toast.error('批量禁用失败，请稍后重试')
    },
  })

  async function handleBulkDisable() {
    if (disableableSelectedUsers.length === 0) return
    const confirmed = await confirm({
      description: `确定禁用已选的 ${disableableSelectedUsers.length} 个用户？禁用后无法登录。`,
      confirmLabel: '批量禁用',
      destructive: true,
    })
    if (!confirmed) return
    bulkDisableMutation.mutate(disableableSelectedUsers.map((user) => user.id))
  }

  function clearUserFilters() {
    setSearchInput('')
    setStatusFilter('all')
    setPage(1)
    clearSort()
    setSearchParams({})
  }

  function handleStatusFilterChange(value: string) {
    setStatusFilter(value)
    setPage(1)
  }

  const columns = useMemo<TableColumnsType<AdminUserSummary>>(
    () =>
      [
        {
          title: '用户',
          key: 'user',
          sorter: true,
          sortOrder: adminAntSortOrder(sort, 'email'),
          render: (_value: unknown, user: AdminUserSummary) => (
            <UserNameCell user={user} tenantFilterId={tenantFilterId} />
          ),
        },
        {
          title: '租户',
          dataIndex: 'tenantSlug',
          key: 'tenantSlug',
          sorter: true,
          sortOrder: adminAntSortOrder(sort, 'tenantSlug'),
          render: (slug: string, user: AdminUserSummary) =>
            tenantFilterId ? (
              <span className="font-mono text-xs">{slug}</span>
            ) : (
              <Link
                to={`/users?tenantId=${encodeURIComponent(user.tenantId)}`}
                className="font-mono text-xs text-muted-foreground transition-colors hover:text-primary"
              >
                {slug}
              </Link>
            ),
        },
        {
          title: '角色',
          key: 'roles',
          render: (_value: unknown, user: AdminUserSummary) => (
            <div className="flex flex-wrap gap-1">
              {user.roles.map((role) => (
                <Badge key={role} variant="outline" className="font-mono text-[10px]">
                  {formatUserRoleLabel(role)}
                </Badge>
              ))}
            </div>
          ),
        },
        {
          title: '状态',
          dataIndex: 'status',
          key: 'status',
          render: (status: string) => <AdminStatusBadge status={status} />,
        },
        {
          title: '最近登录',
          dataIndex: 'lastLoginAt',
          key: 'lastLoginAt',
          sorter: true,
          sortOrder: adminAntSortOrder(sort, 'lastLoginAt'),
          render: (lastLoginAt: number | null) => (
            <span className="text-muted-foreground">
              {lastLoginAt ? formatAdminDate(lastLoginAt) : '—'}
            </span>
          ),
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
        ...(showActions
          ? [
              {
                title: '操作',
                key: 'actions',
                fixed: 'right' as const,
                width: 96,
                render: (_value: unknown, user: AdminUserSummary) => (
                  <TenantRowActions>
                    {canViewAudit ? (
                      <TenantRowAction
                        label="审计"
                        icon={ScrollTextIcon}
                        render={
                          <Link
                            to={buildAuditLogsLink({
                              actorUserId: user.id,
                              tenantId: tenantFilterId,
                            })}
                          />
                        }
                      />
                    ) : null}
                    {canWrite ? (
                      <TenantRowAction
                        label="编辑"
                        icon={PencilIcon}
                        onClick={() => setEditingUser(user)}
                      />
                    ) : null}
                  </TenantRowActions>
                ),
              },
            ]
          : []),
      ].filter((column) => {
        const key = String(column.key)
        if (key === 'actions') return showActions
        return columnPrefs.isColumnVisible(key)
      }),
    [canViewAudit, canWrite, columnPrefs.isColumnVisible, columnPrefs.visible, showActions, sort, tenantFilterId],
  )

  return (
    <div className="space-y-6 admin-stagger">
      <Button
        variant="ghost"
        size="sm"
        className="-ml-2 w-fit"
        nativeButton={false}
        render={<Link to={backLink.to} />}
      >
        <ArrowLeftIcon className="size-3.5" />
        {backLink.label}
      </Button>

      <UsersGuidanceStrip
        tenantFilterId={tenantFilterId}
        tenantLabel={tenantLabel}
        total={total}
        loaded={Boolean(usersQuery.data)}
      />

      {tenantFilterId ? (
        <AdminTenantContextBanner
          tenantId={tenantFilterId}
          tenantLabel={tenantLabel}
          showMembersLink
          onClear={() => setSearchParams({})}
        />
      ) : null}

      <section className="space-y-3">
        <h2 className="admin-display text-xs tracking-[0.18em] text-muted-foreground uppercase">
          状态筛选
        </h2>
        <UsersStatusFilter value={statusFilter} onChange={handleStatusFilterChange} />
      </section>

      <div className="flex flex-wrap items-center gap-3">
        <span className="text-sm text-muted-foreground">租户筛选</span>
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
          <SelectTrigger className="min-w-[220px]">
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

      <AdminTableToolbar
        searchInputRef={searchInputRef}
        search={searchInput}
        onSearchChange={setSearchInput}
        searchPlaceholder="搜索邮箱、显示名或租户 slug…"
        trailing={
          <AdminTableColumnPicker
            columns={[...USER_TABLE_COLUMNS]}
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
              disableableSelectedUsers.length === 0 || bulkDisableMutation.isPending
            }
            onClick={() => void handleBulkDisable()}
          >
            {bulkDisableMutation.isPending ? '处理中…' : '批量禁用'}
          </Button>
        </AdminTableBulkBar>
      ) : null}

      <AdminPanel className="p-0">
        {usersQuery.isLoading ? (
          <AdminTableSkeleton columns={showActions ? 7 : 6} showPagination />
        ) : usersQuery.isError ? (
          <AdminEmptyState
            message="加载失败，请刷新重试"
            onRetry={() => void usersQuery.refetch()}
            isRetrying={usersQuery.isFetching}
          />
        ) : !usersQuery.data?.users.length ? (
          <AdminEmptyState
            message={hasUserFilters ? '无匹配用户' : '暂无用户'}
            action={
              hasUserFilters ? (
                <Button type="button" variant="outline" size="sm" onClick={clearUserFilters}>
                  清除筛选
                </Button>
              ) : tenantFilterId && canReadTenants ? (
                <Button
                  nativeButton={false}
                  size="sm"
                  render={<Link to={`/tenants/${tenantFilterId}?tab=members`} />}
                >
                  <UserPlusIcon className="size-3.5" />
                  前往成员邀请
                </Button>
              ) : undefined
            }
          />
        ) : (
          <AdminAntTable<AdminUserSummary>
            bodyHeight={ADMIN_LIST_TABLE_BODY_HEIGHT}
            rowKey="id"
            columns={columns}
            dataSource={filteredUsers}
            onChange={createAdminAntSortHandler(handleToggleSort)}
            showSorterTooltip={false}
            rowSelection={
              canWrite
                ? {
                    selectedRowKeys,
                    onChange: (keys) => setSelectedRowKeys(keys.map(String)),
                    getCheckboxProps: (user) => ({
                      disabled: user.status === 'disabled',
                    }),
                  }
                : undefined
            }
            pagination={{
              current: page,
              pageSize: baseQueryParams.size,
              total,
              onChange: setPage,
            }}
          />
        )}
      </AdminPanel>

      <EditUserSheet
        user={editingUser}
        open={Boolean(editingUser)}
        onOpenChange={(open) => {
          if (!open) setEditingUser(null)
        }}
        tenantFilterId={tenantFilterId}
      />

      {confirmDialog}
    </div>
  )
}
