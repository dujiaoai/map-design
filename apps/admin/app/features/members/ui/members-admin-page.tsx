import { Badge, Button } from '@repo/ui'
import type { TableColumnsType } from 'antd'
import { useQuery } from '@tanstack/react-query'
import { PencilIcon, UserPlusIcon } from 'lucide-react'
import { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import { useNavigate, useSearchParams } from 'react-router'

import { formatMemberRoleLabel } from '~/features/members/lib/member-role-labels'
import { EditMemberSheet } from '~/features/members/ui/edit-member-sheet'
import { InviteMemberSheet } from '~/features/members/ui/invite-member-sheet'
import { MemberNameCell } from '~/features/members/ui/member-name-cell'
import { MembersGuidanceStrip } from '~/features/members/ui/members-guidance-strip'
import { MembersStatusFilter } from '~/features/members/ui/members-status-filter'
import { TenantDetailMetrics } from '~/features/tenants/ui/tenant-detail-metrics'
import { TenantRowAction, TenantRowActions } from '~/features/tenants/ui/tenant-row-actions'
import { fetchAdminTenant, fetchTenantMembers, fetchTenantQuotas, type AdminUserSummary } from '~/shared/api/admin-api'
import { AdminAntTable, ADMIN_LIST_TABLE_BODY_HEIGHT, adminAntSortOrder, createAdminAntSortHandler } from '~/shared/ant'
import { isPlatformAdmin } from '~/shared/auth/admin-access'
import { useAdminTableFilterState } from '~/shared/hooks/use-admin-table-filter'
import { useAdminListSearchShortcut } from '~/shared/hooks/use-admin-list-search-shortcut'
import { useAdminTableColumnPrefs } from '~/shared/hooks/use-admin-table-column-prefs'
import { useAdminTableSort } from '~/shared/hooks/use-admin-table-sort'
import { useAdminPermissions } from '~/shared/hooks/use-admin-permissions'
import { adminQueryKeys } from '~/shared/lib/admin-query-keys'
import { resolveTenantScopedAdminBackLink } from '~/shared/lib/tenant-scoped-admin-nav'
import { AdminTableColumnPicker } from '~/shared/ui/admin-table-column-picker'
import { AdminTableSortHint } from '~/shared/ui/admin-data-table'
import { AdminEmptyState, AdminPageBackButton, AdminPanel } from '~/shared/ui/admin-page-shell'
import { AdminTenantContextBanner } from '~/shared/ui/admin-tenant-context-banner'
import { AdminTableSkeleton } from '~/shared/ui/admin-table-skeleton'
import { AdminTableToolbar } from '~/shared/ui/admin-table-toolbar'
import { AdminStatusBadge, formatAdminDate } from '~/shared/ui/admin-status-badge'

type MemberSortKey = 'email' | 'displayName' | 'lastLoginAt' | 'createdAt'

const MEMBER_TABLE_COLUMNS = [
  { key: 'member', label: '成员' },
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

  const backLink = resolveTenantScopedAdminBackLink(searchParams, {
    tenantTab: 'members',
    canReadTenants,
  })

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
          title: '成员',
          key: 'member',
          sorter: true,
          sortOrder: adminAntSortOrder(sort, 'email'),
          render: (_value: unknown, member: AdminUserSummary) => <MemberNameCell member={member} />,
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
                fixed: 'right' as const,
                width: 72,
                render: (_value: unknown, member: AdminUserSummary) => (
                  <TenantRowActions>
                    <TenantRowAction
                      label="编辑"
                      icon={PencilIcon}
                      onClick={() => setEditingMember(member)}
                    />
                  </TenantRowActions>
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

  const content = (
    <>
      {!embedded ? <AdminPageBackButton backLink={backLink} /> : null}

      <MembersGuidanceStrip
        tenantId={tenantId}
        tenantLabel={tenantContextLabel}
        total={memberTotal}
        loaded={Boolean(membersQuery.data)}
        embedded={embedded}
        seatFull={seatFull}
        canWrite={canWrite}
        onInvite={() => setInviteOpen(true)}
      />

      {!embedded ? (
        <AdminTenantContextBanner
          tenantId={tenantId}
          tenantLabel={tenantContextLabel}
          showMembersLink={false}
          showUsersLink
          onClear={showTenantClear ? () => void navigate('/members') : undefined}
        />
      ) : null}

      <TenantDetailMetrics tenantId={tenantId} />

      <section className="space-y-3">
        <h2 className="admin-display text-xs tracking-[0.18em] text-muted-foreground uppercase">
          状态筛选
        </h2>
        <MembersStatusFilter value={filter.status} onChange={filter.setStatus} />
      </section>

      <AdminTableToolbar
        searchInputRef={searchInputRef}
        search={filter.search}
        onSearchChange={filter.setSearch}
        searchPlaceholder="搜索邮箱或显示名…"
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
          <AdminTableSkeleton columns={canWrite ? 6 : 5} />
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
