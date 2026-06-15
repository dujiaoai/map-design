import { Badge, Button } from '@repo/ui'
import { useSession } from '@repo/auth'
import { useQuery } from '@tanstack/react-query'
import { PencilIcon } from 'lucide-react'
import { useMemo, useRef, useState } from 'react'
import { useNavigate, useSearchParams } from 'react-router'

import { fetchAdminTenant, fetchTenantMembers, type AdminUserSummary } from '~/shared/api/admin-api'
import { isPlatformAdmin } from '~/shared/auth/admin-access'
import {
  useAdminTableFilterState,
  useFilteredAdminRows,
} from '~/shared/hooks/use-admin-table-filter'
import { useAdminListSearchShortcut } from '~/shared/hooks/use-admin-list-search-shortcut'
import { sortAdminTableRows, useAdminTableSort } from '~/shared/hooks/use-admin-table-sort'
import { useAdminPermissions } from '~/shared/hooks/use-admin-permissions'
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
import { AdminTenantContextBanner } from '~/shared/ui/admin-tenant-context-banner'
import { AdminTableSkeleton } from '~/shared/ui/admin-table-skeleton'
import { AdminTableToolbar } from '~/shared/ui/admin-table-toolbar'
import { AdminStatusBadge, formatAdminDate } from '~/shared/ui/admin-status-badge'

import { EditMemberSheet } from './edit-member-sheet'
import { InviteMemberSheet } from './invite-member-sheet'

type MemberSortKey = 'email' | 'displayName' | 'lastLoginAt' | 'createdAt'

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
  const canWrite = can('admin:members:write') || can('admin:tenants:write')
  const navigate = useNavigate()
  const [searchParams] = useSearchParams()
  const showTenantClear =
    !embedded && isPlatformAdmin(session) && Boolean(searchParams.get('tenantId'))

  const [inviteOpen, setInviteOpen] = useState(false)
  const [editingMember, setEditingMember] = useState<AdminUserSummary | null>(null)

  const membersQuery = useQuery({
    queryKey: adminQueryKeys.members(tenantId),
    queryFn: () => fetchTenantMembers(tenantId),
  })

  const tenantQuery = useQuery({
    queryKey: adminQueryKeys.tenant(tenantId),
    queryFn: () => fetchAdminTenant(tenantId),
    enabled: !embedded,
    staleTime: 60_000,
  })

  const resolvedTenantName = tenantName ?? tenantQuery.data?.name ?? session?.tenant?.name ?? '当前租户'
  const tenantContextLabel = tenantQuery.data
    ? `${tenantQuery.data.name} (${tenantQuery.data.slug})`
    : resolvedTenantName
  const filter = useAdminTableFilterState()
  const searchInputRef = useRef<HTMLInputElement>(null)
  useAdminListSearchShortcut(searchInputRef)
  const { sort, toggleSort, clearSort } = useAdminTableSort<MemberSortKey>()
  const memberSearchKeys: (keyof AdminUserSummary)[] = ['email', 'displayName']
  const filteredMembersRaw = useFilteredAdminRows(
    membersQuery.data?.members,
    filter,
    memberSearchKeys,
    'status',
  )
  const filteredMembers = useMemo(
    () =>
      sortAdminTableRows(filteredMembersRaw, sort, {
        email: (member) => member.email.toLowerCase(),
        displayName: (member) => (member.displayName ?? '').toLowerCase(),
        lastLoginAt: (member) => member.lastLoginAt ?? '',
        createdAt: (member) => member.createdAt,
      }),
    [filteredMembersRaw, sort],
  )

  const memberTotal = membersQuery.data?.members.length ?? 0

  const content = (
    <>
      {!embedded ? (
        <AdminPageHeader
          eyebrow="Members"
          title="租户成员"
          description={appendAdminListTotal(
            `${resolvedTenantName} · 管理本租户成员与角色分配。`,
            { total: memberTotal, loaded: Boolean(membersQuery.data), unit: '名' },
          )}
          actions={
            canWrite ? (
              <Button onClick={() => setInviteOpen(true)}>邀请链接</Button>
            ) : null
          }
        />
      ) : canWrite ? (
        <div className="flex justify-end">
          <Button onClick={() => setInviteOpen(true)}>邀请成员</Button>
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
          { value: 'disabled', label: 'disabled' },
        ]}
      />

      <AdminTableSortHint sort={sort} onClearSort={clearSort} scope="loaded" />

      <AdminPanel>
        {membersQuery.isLoading ? (
          <AdminTableSkeleton columns={canWrite ? 7 : 6} />
        ) : membersQuery.isError ? (
          <AdminEmptyState
            message="加载失败，请确认租户权限后重试"
            onRetry={() => void membersQuery.refetch()}
            isRetrying={membersQuery.isFetching}
          />
        ) : !membersQuery.data?.members.length ? (
          <AdminEmptyState message="暂无成员" />
        ) : !filteredMembers.length ? (
          <AdminEmptyState
            message="无匹配成员"
            action={
              <Button type="button" variant="outline" size="sm" onClick={filter.resetFilters}>
                清除筛选
              </Button>
            }
          />
        ) : (
          <AdminDataTable>
            <AdminTableHead>
              <tr>
                <AdminTableSortHeaderCell
                  label="邮箱"
                  active={sort?.key === 'email'}
                  direction={sort?.key === 'email' ? sort.direction : undefined}
                  onSort={() => toggleSort('email')}
                />
                <AdminTableSortHeaderCell
                  label="显示名"
                  active={sort?.key === 'displayName'}
                  direction={sort?.key === 'displayName' ? sort.direction : undefined}
                  onSort={() => toggleSort('displayName')}
                />
                <AdminTableHeaderCell>角色</AdminTableHeaderCell>
                <AdminTableHeaderCell>状态</AdminTableHeaderCell>
                <AdminTableSortHeaderCell
                  label="最近登录"
                  active={sort?.key === 'lastLoginAt'}
                  direction={sort?.key === 'lastLoginAt' ? sort.direction : undefined}
                  onSort={() => toggleSort('lastLoginAt')}
                />
                <AdminTableSortHeaderCell
                  label="创建时间"
                  active={sort?.key === 'createdAt'}
                  direction={sort?.key === 'createdAt' ? sort.direction : undefined}
                  onSort={() => toggleSort('createdAt')}
                />
                {canWrite ? (
                  <AdminTableHeaderCell className="text-right">操作</AdminTableHeaderCell>
                ) : null}
              </tr>
            </AdminTableHead>
            <AdminTableBody>
              {filteredMembers.map((member) => (
                <AdminTableRow key={member.id}>
                  <AdminTableCell>{member.email}</AdminTableCell>
                  <AdminTableCell>{member.displayName}</AdminTableCell>
                  <AdminTableCell>
                    <div className="flex flex-wrap gap-1">
                      {member.roles.map((role) => (
                        <Badge key={role} variant="outline" className="font-mono text-[10px]">
                          {role}
                        </Badge>
                      ))}
                    </div>
                  </AdminTableCell>
                  <AdminTableCell>
                    <AdminStatusBadge status={member.status} />
                  </AdminTableCell>
                  <AdminTableCell className="text-muted-foreground">
                    {member.lastLoginAt ? formatAdminDate(member.lastLoginAt) : '—'}
                  </AdminTableCell>
                  <AdminTableCell className="text-muted-foreground">
                    {formatAdminDate(member.createdAt)}
                  </AdminTableCell>
                  {canWrite ? (
                    <AdminTableCell className="text-right">
                      <Button variant="ghost" size="sm" onClick={() => setEditingMember(member)}>
                        <PencilIcon className="size-3.5" />
                        编辑
                      </Button>
                    </AdminTableCell>
                  ) : null}
                </AdminTableRow>
              ))}
            </AdminTableBody>
          </AdminDataTable>
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
