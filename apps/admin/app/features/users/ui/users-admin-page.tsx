import { Badge, Button, Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@repo/ui'
import { PencilIcon } from 'lucide-react'
import { useMemo, useState } from 'react'
import { useSearchParams } from 'react-router'

import { fetchAdminTenants, fetchAdminUsers, type AdminUserSummary } from '~/shared/api/admin-api'
import { useAdminPagedListState, useAdminPagedQuery } from '~/shared/hooks/use-admin-paged-list'
import { filterAdminTableRows } from '~/shared/hooks/use-admin-table-filter'
import { useAdminPermissions } from '~/shared/hooks/use-admin-permissions'
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
import { AdminTableSkeleton } from '~/shared/ui/admin-table-skeleton'
import { AdminTablePagination } from '~/shared/ui/admin-table-pagination'
import { AdminTableToolbar } from '~/shared/ui/admin-table-toolbar'
import { AdminStatusBadge, formatAdminDate } from '~/shared/ui/admin-status-badge'

import { EditUserSheet } from './edit-user-sheet'
import { InviteUserSheet } from './invite-user-sheet'

export function UsersAdminPage() {
  const { can } = useAdminPermissions()
  const canWrite = can('admin:users:write')
  const [searchParams, setSearchParams] = useSearchParams()
  const tenantFilterId = searchParams.get('tenantId') ?? undefined

  const [inviteOpen, setInviteOpen] = useState(false)
  const [editingUser, setEditingUser] = useState<AdminUserSummary | null>(null)
  const [statusFilter, setStatusFilter] = useState('all')

  const { searchInput, setSearchInput, page, setPage, queryParams } = useAdminPagedListState()

  const tenantsQuery = useAdminPagedQuery({
    queryKey: adminQueryKeys.tenantsAll,
    queryFn: () => fetchAdminTenants(),
  })

  const usersQuery = useAdminPagedQuery({
    queryKey: adminQueryKeys.users(tenantFilterId, {
      ...queryParams,
      status: statusFilter === 'all' ? undefined : (statusFilter as 'active' | 'disabled' | 'invited'),
    }),
    queryFn: () =>
      fetchAdminUsers(tenantFilterId, {
        ...queryParams,
        status: statusFilter === 'all' ? undefined : (statusFilter as 'active' | 'disabled' | 'invited'),
      }),
  })

  const tenantLabel = useMemo(() => {
    if (!tenantFilterId) return '全部租户'
    const tenant = tenantsQuery.data?.tenants.find((item) => item.id === tenantFilterId)
    return tenant ? `${tenant.name} (${tenant.slug})` : tenantFilterId
  }, [tenantFilterId, tenantsQuery.data?.tenants])

  const userSearchKeys: (keyof AdminUserSummary)[] = ['email', 'displayName', 'tenantSlug']
  const filteredUsers = useMemo(
    () =>
      filterAdminTableRows(usersQuery.data?.users, {
        search: '',
        searchKeys: userSearchKeys,
      }),
    [usersQuery.data?.users],
  )

  const total = usersQuery.data?.total ?? usersQuery.data?.users.length ?? 0

  return (
    <div className="space-y-6">
      <AdminPageHeader
        title="用户"
        description="跨租户用户列表；可按租户筛选并邀请新成员。"
        actions={
          canWrite ? (
            <Button onClick={() => setInviteOpen(true)}>邀请用户</Button>
          ) : null
        }
      />

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
      />

      <AdminPanel className="p-0">
        {usersQuery.isLoading ? (
          <AdminTableSkeleton columns={canWrite ? 8 : 7} showPagination />
        ) : usersQuery.isError ? (
          <AdminEmptyState message="加载失败，请刷新重试" />
        ) : !usersQuery.data?.users.length ? (
          <AdminEmptyState message="暂无用户" />
        ) : !filteredUsers.length ? (
          <AdminEmptyState message="无匹配用户" />
        ) : (
          <>
            <AdminDataTable>
              <AdminTableHead>
                <tr>
                  <AdminTableHeaderCell>邮箱</AdminTableHeaderCell>
                  <AdminTableHeaderCell>显示名</AdminTableHeaderCell>
                  <AdminTableHeaderCell>租户</AdminTableHeaderCell>
                  <AdminTableHeaderCell>角色</AdminTableHeaderCell>
                  <AdminTableHeaderCell>状态</AdminTableHeaderCell>
                  <AdminTableHeaderCell>最近登录</AdminTableHeaderCell>
                  <AdminTableHeaderCell>创建时间</AdminTableHeaderCell>
                  {canWrite ? (
                    <AdminTableHeaderCell className="text-right">操作</AdminTableHeaderCell>
                  ) : null}
                </tr>
              </AdminTableHead>
              <AdminTableBody>
                {filteredUsers.map((user) => (
                  <AdminTableRow key={user.id}>
                    <AdminTableCell>{user.email}</AdminTableCell>
                    <AdminTableCell>{user.displayName}</AdminTableCell>
                    <AdminTableCell mono>{user.tenantSlug}</AdminTableCell>
                    <AdminTableCell>
                      <div className="flex flex-wrap gap-1">
                        {user.roles.map((role) => (
                          <Badge key={role} variant="outline" className="font-mono text-[10px]">
                            {role}
                          </Badge>
                        ))}
                      </div>
                    </AdminTableCell>
                    <AdminTableCell>
                      <AdminStatusBadge status={user.status} />
                    </AdminTableCell>
                    <AdminTableCell className="text-muted-foreground">
                      {user.lastLoginAt ? formatAdminDate(user.lastLoginAt) : '—'}
                    </AdminTableCell>
                    <AdminTableCell className="text-muted-foreground">
                      {formatAdminDate(user.createdAt)}
                    </AdminTableCell>
                    {canWrite ? (
                      <AdminTableCell className="text-right">
                        <Button variant="ghost" size="sm" onClick={() => setEditingUser(user)}>
                          <PencilIcon className="size-3.5" />
                          编辑
                        </Button>
                      </AdminTableCell>
                    ) : null}
                  </AdminTableRow>
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

      <InviteUserSheet
        open={inviteOpen}
        onOpenChange={setInviteOpen}
        defaultTenantId={tenantFilterId}
      />
      <EditUserSheet
        user={editingUser}
        open={Boolean(editingUser)}
        onOpenChange={(open) => {
          if (!open) setEditingUser(null)
        }}
        tenantFilterId={tenantFilterId}
      />
    </div>
  )
}
