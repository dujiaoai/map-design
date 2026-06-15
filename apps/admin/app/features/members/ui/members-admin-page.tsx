import { Badge, Button } from '@repo/ui'
import { useQuery } from '@tanstack/react-query'
import { PencilIcon } from 'lucide-react'
import { useState } from 'react'

import { fetchTenantMembers, type AdminUserSummary } from '~/shared/api/admin-api'
import {
  useAdminTableFilterState,
  useFilteredAdminRows,
} from '~/shared/hooks/use-admin-table-filter'
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
import { AdminTableToolbar } from '~/shared/ui/admin-table-toolbar'
import { AdminStatusBadge, formatAdminDate } from '~/shared/ui/admin-status-badge'

import { EditMemberSheet } from './edit-member-sheet'
import { InviteMemberSheet } from './invite-member-sheet'

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

  const [inviteOpen, setInviteOpen] = useState(false)
  const [editingMember, setEditingMember] = useState<AdminUserSummary | null>(null)

  const membersQuery = useQuery({
    queryKey: adminQueryKeys.members(tenantId),
    queryFn: () => fetchTenantMembers(tenantId),
  })

  const resolvedTenantName = tenantName ?? session?.tenant?.name ?? '当前租户'
  const filter = useAdminTableFilterState()
  const memberSearchKeys: (keyof AdminUserSummary)[] = ['email', 'displayName']
  const filteredMembers = useFilteredAdminRows(
    membersQuery.data?.members,
    filter,
    memberSearchKeys,
    'status',
  )

  const content = (
    <>
      {!embedded ? (
        <AdminPageHeader
          eyebrow="Members"
          title="租户成员"
          description={`${resolvedTenantName} · 管理本租户成员与角色分配。`}
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

      <AdminTableToolbar
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

      <AdminPanel>
        {membersQuery.isLoading ? (
          <AdminTableSkeleton columns={canWrite ? 7 : 6} />
        ) : membersQuery.isError ? (
          <AdminEmptyState message="加载失败，请确认租户权限后重试" />
        ) : !membersQuery.data?.members.length ? (
          <AdminEmptyState message="暂无成员" />
        ) : !filteredMembers.length ? (
          <AdminEmptyState message="无匹配成员" />
        ) : (
          <AdminDataTable>
            <AdminTableHead>
              <tr>
                <AdminTableHeaderCell>邮箱</AdminTableHeaderCell>
                <AdminTableHeaderCell>显示名</AdminTableHeaderCell>
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

  return <div className="space-y-6">{content}</div>
}
