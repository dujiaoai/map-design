import { Badge, Button } from '@repo/ui'
import type { TableColumnsType } from 'antd'
import { useQuery } from '@tanstack/react-query'
import { ArrowLeftIcon, PencilIcon, UserPlusIcon } from 'lucide-react'
import { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import { Link, useNavigate, useSearchParams } from 'react-router'

import { formatMemberRoleLabel } from '~/features/members/lib/member-role-labels'
import { fetchAdminTenant, fetchTenantMembers, fetchTenantQuotas, type AdminUserSummary } from '~/shared/api/admin-api'
import { AdminAntTable, ADMIN_LIST_TABLE_BODY_HEIGHT, adminAntSortOrder, createAdminAntSortHandler } from '~/shared/ant'
import { isPlatformAdmin } from '~/shared/auth/admin-access'
import {
  useAdminTableFilterState,
} from '~/shared/hooks/use-admin-table-filter'
import { useAdminListSearchShortcut } from '~/shared/hooks/use-admin-list-search-shortcut'
import { useAdminTableColumnPrefs } from '~/shared/hooks/use-admin-table-column-prefs'
import { useAdminTableSort } from '~/shared/hooks/use-admin-table-sort'
import { useAdminPermissions } from '~/shared/hooks/use-admin-permissions'
import { adminQueryKeys } from '~/shared/lib/admin-query-keys'
import { appendAdminListTotal } from '~/shared/lib/format-admin-list-description'
import { AdminTableColumnPicker } from '~/shared/ui/admin-table-column-picker'
import { AdminTableSortHint } from '~/shared/ui/admin-data-table'
import { AdminEmptyState, AdminPageHeader, AdminPanel } from '~/shared/ui/admin-page-shell'
import { AdminTenantContextBanner } from '~/shared/ui/admin-tenant-context-banner'
import { AdminTableSkeleton } from '~/shared/ui/admin-table-skeleton'
import { AdminTableToolbar } from '~/shared/ui/admin-table-toolbar'
import { AdminStatusBadge, formatAdminDate } from '~/shared/ui/admin-status-badge'

import { EditMemberSheet } from './edit-member-sheet'
import { InviteMemberSheet } from './invite-member-sheet'
import { TenantQuotaSummary } from './tenant-quota-summary'

type MemberSortKey = 'email' | 'displayName' | 'lastLoginAt' | 'createdAt'

const MEMBER_TABLE_COLUMNS = [
  { key: 'email', label: '邮箱' },
  { key: 'displayName', label: '显示名' },
  { key: 'roles', label: '角色' },
  { key: 'status', label: '状态' },
  { key: 'lastLoginAt', label: '最近登录' },
  { key: 'createdAt', label: '创建时间' },
] as const

export function MembersAdminPage({
  tenantId,
  tenantName,
  embedded = false,
}: {
  tenantId: string
  tenantName?: string
  embedded?: boolean
}) {
  const { can, session } = useAdminPermissions()
  const canWrite =
    isPlatformAdmin(session) || can('admin:members:write') || can('admin:tenants:write')
  const canReadTenants = can('admin:tenants:read')
  const navigate = useNavigate()
  const [searchParams] = useSearchParams()
  const showTenantClear =
    !embedded && isPlatformAdmin(session) && Boolean(searchParams.get('tenantId'))

  const [inviteOpen, setInviteOpen] = useState(false)
  const [editingMember, setEditingMember] = useState<AdminUserSummary | null>(null)
  const columnPrefs = useAdminTableColumnPrefs('members', [...MEMBER_TABLE_COLUMNS])

  const filter = useAdminTableFilterState()
  const [debouncedSearch, setDebouncedSearch] = useState('')
  const searchInputRef = useRef<HTMLInputElement>(null)
  useAdminListSearchShortcut(searchInputRef)
  const { sort, toggleSort, clearSort } = useAdminTableSort<MemberSortKey>()

  useEffect(() => {
    const timer = window.setTimeout(() => {
      setDebouncedSearch(filter.search.trim())
    }, 300)
    return () => window.clearTimeout(timer)
  }, [filter.search])

  const listParams = useMemo(
    () => ({
      q: debouncedSearch || undefined,
      status:
        filter.status === 'all' ? undefined : (filter.status as 'active' | 'disabled' | 'invited'),
      ...(sort ? { sortBy: sort.key, sortDir: sort.direction } : {}),
    }),
    [debouncedSearch, filter.status, sort],
  )

  const membersQuery = useQuery({
    queryKey: adminQueryKeys.members(tenantId, listParams),
    queryFn: () => fetchTenantMembers(tenantId, listParams),
  })

  const tenantQuery = useQuery({
    queryKey: adminQueryKeys.tenant(tenantId),
    queryFn: () => fetchAdminTenant(tenantId),
    enabled: !embedded,
    staleTime: 60_000,
  })

  const quotasQuery = useQuery({
    queryKey: adminQueryKeys.tenantQuotas(tenantId),
    queryFn: () => fetchTenantQuotas(tenantId),
    staleTime: 30_000,
  })

  const seatFull =
    quotasQuery.data?.seats.limit != null &&
    quotasQuery.data.seats.used >= quotasQuery.data.seats.limit

  const resolvedTenantName = tenantName ?? tenantQuery.data?.name ?? session?.tenant?.name ?? '当前租户'
  const tenantContextLabel = tenantQuery.data
    ? `${tenantQuery.data.name} (${tenantQuery.data.slug})`
    : resolvedTenantName

  const backLink =
    canReadTenants
      ? { to: `/tenants/${tenantId}?tab=members`, label: '返回租户' }
      : { to: '/', label: '返回概览' }

  const members = membersQuery.data?.members ?? []

  const hasMemberFilters =
    debouncedSearch.length > 0 || filter.status !== 'all' || Boolean(sort)

  const clearMemberFilters = useCallback(() => {
    filter.resetFilters()
    clearSort()
  }, [filter, clearSort])

  const memberTotal = members.length

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
          title: '角色',
          key: 'roles',
          render: (_value: unknown, member: AdminUserSummary) => (
            <div className="flex flex-wrap gap-1">
              {member.roles.map((role) => (
                <Badge key={role} variant="outline" className="font-mono text-[10px]">
                  {formatMemberRoleLabel(role)}
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
        ...(canWrite
          ? [
              {
                title: '操作',
                key: 'actions',
                align: 'right' as const,
                render: (_value: unknown, member: AdminUserSummary) => (
                  <Button variant="ghost" size="sm" onClick={() => setEditingMember(member)}>
                    <PencilIcon className="size-3.5" />
                    编辑
                  </Button>
                ),
              },
            ]
          : []),
      ].filter((column) => {
        const key = String(column.key)
        if (key === 'actions') return canWrite
        return columnPrefs.isColumnVisible(key)
      }),
    [canWrite, columnPrefs.isColumnVisible, columnPrefs.visible, sort],
  )

  const inviteButton = canWrite ? (
    <Button
      onClick={() => setInviteOpen(true)}
      disabled={seatFull}
      title={seatFull ? '成员席位已满，无法继续邀请' : undefined}
    >
      <UserPlusIcon className="size-3.5" />
      {embedded ? '邀请成员' : '邀请成员'}
    </Button>
  ) : null

  const content = (
    <>
      {!embedded ? (
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
      ) : null}

      {!embedded ? (
        <AdminPageHeader
          eyebrow="Members"
          title="租户成员"
          description={appendAdminListTotal(
            `${resolvedTenantName} · 管理本租户成员与角色分配。`,
            { total: memberTotal, loaded: Boolean(membersQuery.data), unit: '名' },
          )}
          actions={inviteButton}
        />
      ) : canWrite ? (
        <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
          <p className="text-sm text-muted-foreground">
            管理成员、角色与邀请；跨租户用户请前往「用户」页。
          </p>
          {inviteButton}
        </div>
      ) : null}

      {!embedded ? (
        <AdminTenantContextBanner
          tenantId={tenantId}
          tenantLabel={tenantContextLabel}
          showMembersLink={false}
          showUsersLink
          onClear={showTenantClear ? () => void navigate('/members') : undefined}
        />
      ) : null}

      <TenantQuotaSummary tenantId={tenantId} />

      <AdminTableToolbar
        searchInputRef={searchInputRef}
        search={filter.search}
        onSearchChange={filter.setSearch}
        searchPlaceholder="搜索邮箱或显示名…"
        status={filter.status}
        onStatusChange={filter.setStatus}
        statusOptions={[
          { value: 'all', label: '全部状态' },
          { value: 'active', label: 'active' },
          { value: 'invited', label: 'invited' },
          { value: 'disabled', label: 'disabled' },
        ]}
        trailing={
          <AdminTableColumnPicker
            columns={[...MEMBER_TABLE_COLUMNS]}
            visible={columnPrefs.visible}
            onVisibleChange={columnPrefs.setColumnVisible}
            onReset={columnPrefs.resetColumns}
          />
        }
      />

      <AdminTableSortHint sort={sort} onClearSort={clearSort} scope="server" />

      <AdminPanel className="p-0">
        {membersQuery.isLoading ? (
          <AdminTableSkeleton columns={canWrite ? 7 : 6} />
        ) : membersQuery.isError ? (
          <AdminEmptyState
            message="加载失败，请确认租户权限后重试"
            onRetry={() => void membersQuery.refetch()}
            isRetrying={membersQuery.isFetching}
          />
        ) : !members.length ? (
          <AdminEmptyState
            message={hasMemberFilters ? '无匹配成员' : '暂无成员'}
            action={
              hasMemberFilters ? (
                <Button type="button" variant="outline" size="sm" onClick={clearMemberFilters}>
                  清除筛选
                </Button>
              ) : canWrite && !seatFull ? (
                <Button type="button" size="sm" onClick={() => setInviteOpen(true)}>
                  <UserPlusIcon className="size-3.5" />
                  邀请首位成员
                </Button>
              ) : seatFull ? (
                <p className="text-xs text-muted-foreground">成员席位已满</p>
              ) : undefined
            }
          />
        ) : (
          <AdminAntTable<AdminUserSummary>
            bodyHeight={ADMIN_LIST_TABLE_BODY_HEIGHT}
            rowKey="id"
            columns={columns}
            dataSource={members}
            onChange={createAdminAntSortHandler(toggleSort)}
            showSorterTooltip={false}
            pagination={false}
          />
        )}
      </AdminPanel>

      <InviteMemberSheet tenantId={tenantId} open={inviteOpen} onOpenChange={setInviteOpen} />
      <EditMemberSheet
        tenantId={tenantId}
        member={editingMember}
        open={Boolean(editingMember)}
        onOpenChange={(open) => {
          if (!open) setEditingMember(null)
        }}
      />
    </>
  )

  if (embedded) {
    return <div className="space-y-4">{content}</div>
  }

  return <div className="space-y-6 admin-stagger">{content}</div>
}
