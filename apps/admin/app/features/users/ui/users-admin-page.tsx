import { Badge, Button, Select, SelectContent, SelectItem, SelectTrigger, SelectValue, toast, useConfirmDialog } from '@repo/ui'
import type { TableColumnsType } from 'antd'
import { useMutation, useQueryClient } from '@tanstack/react-query'
import { PencilIcon, ScrollTextIcon } from 'lucide-react'
import { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import { Link, useSearchParams } from 'react-router'

import { AUDIT_READ_PERMISSIONS } from '~/features/audit-logs/lib/audit-log-permissions'
import { buildAuditLogsLink } from '~/features/audit-logs/lib/audit-log-nav'
import { fetchAdminTenants, fetchAdminUsers, patchAdminUser, type AdminUserSummary } from '~/shared/api/admin-api'
import { AdminAntTable, ADMIN_LIST_TABLE_BODY_HEIGHT, adminAntSortOrder, createAdminAntSortHandler } from '~/shared/ant'
import { useAdminPagedListState, useAdminPagedQuery } from '~/shared/hooks/use-admin-paged-list'
import { useAdminListSearchShortcut } from '~/shared/hooks/use-admin-list-search-shortcut'
import { filterAdminTableRows } from '~/shared/hooks/use-admin-table-filter'
import { useAdminTableColumnPrefs } from '~/shared/hooks/use-admin-table-column-prefs'
import { useAdminTableSort } from '~/shared/hooks/use-admin-table-sort'
import { useAdminPermissions } from '~/shared/hooks/use-admin-permissions'
import { adminQueryKeys } from '~/shared/lib/admin-query-keys'
import { appendAdminListTotal } from '~/shared/lib/format-admin-list-description'
import { AdminTableSortHint } from '~/shared/ui/admin-data-table'
import { AdminTableBulkBar } from '~/shared/ui/admin-table-bulk-bar'
import { AdminEmptyState, AdminPageHeader, AdminPanel } from '~/shared/ui/admin-page-shell'
import { AdminTenantContextBanner } from '~/shared/ui/admin-tenant-context-banner'
import { AdminTableSkeleton } from '~/shared/ui/admin-table-skeleton'
import { AdminTableColumnPicker } from '~/shared/ui/admin-table-column-picker'
import { AdminTableToolbar } from '~/shared/ui/admin-table-toolbar'
import { AdminStatusBadge, formatAdminDate } from '~/shared/ui/admin-status-badge'

import { EditUserSheet } from './edit-user-sheet'

type UserSortKey = 'email' | 'displayName' | 'tenantSlug' | 'lastLoginAt' | 'createdAt'

const USER_TABLE_COLUMNS = [
  { key: 'email', label: '邮箱' },
  { key: 'displayName', label: '显示名' },
  { key: 'tenantSlug', label: '租户' },
  { key: 'roles', label: '角色' },
  { key: 'status', label: '状态' },
  { key: 'lastLoginAt', label: '最近登录' },
  { key: 'createdAt', label: '创建时间' },
] as const

export function UsersAdminPage() {
  const { can, canAny } = useAdminPermissions()
  const canWrite = can('admin:users:write')
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

  const userSearchKeys: (keyof AdminUserSummary)[] = ['email', 'displayName', 'tenantSlug']
  const filteredUsers = useMemo(() => {
    return filterAdminTableRows(usersQuery.data?.users, {
      search: '',
      searchKeys: userSearchKeys,
    })
  }, [usersQuery.data?.users])

  const total = usersQuery.data?.total ?? usersQuery.data?.users.length ?? 0
  const showActions = canWrite || canViewAudit

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

  const columns = useMemo<TableColumnsType<AdminUserSummary>>(
    () =>
      [
        {
          title: '邮箱',
          dataIndex: 'email',
          key: 'email',
          sorter: true,
          sortOrder: adminAntSortOrder(sort, 'email'),
        },
        {
          title: '显示名',
          dataIndex: 'displayName',
          key: 'displayName',
          sorter: true,
          sortOrder: adminAntSortOrder(sort, 'displayName'),
        },
        {
          title: '租户',
          dataIndex: 'tenantSlug',
          key: 'tenantSlug',
          sorter: true,
          sortOrder: adminAntSortOrder(sort, 'tenantSlug'),
          render: (slug: string) => <span className="font-mono text-xs">{slug}</span>,
        },
        {
          title: '角色',
          key: 'roles',
          render: (_value: unknown, user: AdminUserSummary) => (
            <div className="flex flex-wrap gap-1">
              {user.roles.map((role) => (
                <Badge key={role} variant="outline" className="font-mono text-[10px]">
                  {role}
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
                align: 'right' as const,
                render: (_value: unknown, user: AdminUserSummary) => (
                  <div className="flex justify-end gap-1">
                    {canViewAudit ? (
                      <Button
                        nativeButton={false}
                        variant="ghost"
                        size="sm"
                        render={
                          <Link
                            to={buildAuditLogsLink({
                              actorUserId: user.id,
                              tenantId: tenantFilterId,
                            })}
                          />
                        }
                      >
                        <ScrollTextIcon className="size-3.5" />
                        审计
                      </Button>
                    ) : null}
                    {canWrite ? (
                      <Button variant="ghost" size="sm" onClick={() => setEditingUser(user)}>
                        <PencilIcon className="size-3.5" />
                        编辑
                      </Button>
                    ) : null}
                  </div>
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
      <AdminPageHeader
        eyebrow="Users"
        title="用户"
        description={appendAdminListTotal(
          '跨租户用户列表；邀请新成员请前往对应租户的「成员」页生成邀请链接。',
          { total, loaded: Boolean(usersQuery.data), unit: '个' },
        )}
        actions={null}
      />

      {tenantFilterId ? (
        <AdminTenantContextBanner
          tenantId={tenantFilterId}
          tenantLabel={tenantLabel}
          showMembersLink
          onClear={() => setSearchParams({})}
        />
      ) : null}

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
        status={statusFilter}
        onStatusChange={(value) => {
          setStatusFilter(value)
          setPage(1)
        }}
        statusOptions={[
          { value: 'all', label: '全部状态' },
          { value: 'active', label: 'active' },
          { value: 'invited', label: 'invited' },
          { value: 'disabled', label: 'disabled' },
        ]}
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
          <AdminTableSkeleton columns={showActions ? 8 : 7} showPagination />
        ) : usersQuery.isError ? (
          <AdminEmptyState
            message="加载失败，请刷新重试"
            onRetry={() => void usersQuery.refetch()}
            isRetrying={usersQuery.isFetching}
          />
        ) : !usersQuery.data?.users.length ? (
          <AdminEmptyState message="暂无用户" />
        ) : !filteredUsers.length ? (
          <AdminEmptyState
            message="无匹配用户"
            action={
              <Button type="button" variant="outline" size="sm" onClick={clearUserFilters}>
                清除筛选
              </Button>
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
