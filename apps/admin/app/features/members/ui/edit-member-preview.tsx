import { UserIcon } from 'lucide-react'

import {
  formatMemberRoleLabel,
  memberInitials,
} from '~/features/members/lib/member-role-labels'
import type { AssignableRoleSummary } from '~/entities/tenant-role'
import type { AdminUserSummary } from '~/entities/user'
import { AdminStatusBadge, formatAdminDate } from '~/shared/ui/admin-status-badge'
import { AdminStatusPill } from '~/shared/ui/admin-status-pill'

export function EditMemberPreview({
  member,
  displayName,
  roleCode,
  status,
  roles,
}: {
  member: AdminUserSummary
  displayName: string
  roleCode: string
  status: 'active' | 'disabled'
  roles: AssignableRoleSummary[]
}) {
  const roleMeta = roles.find((role) => role.code === roleCode)
  const previewName = displayName.trim() || member.displayName || member.email
  const isInvited = member.status === 'invited'

  return (
    <div className="admin-create-tenant-preview rounded-xl border border-primary/25 bg-primary/6 p-4">
      <p className="admin-display text-[10px] tracking-[0.2em] text-primary/70 uppercase">
        变更预览
      </p>
      <div className="mt-3 flex items-start gap-3">
        <span
          className="admin-tenant-avatar flex size-11 shrink-0 items-center justify-center rounded-xl border border-primary/30 bg-primary/12 text-sm font-semibold text-primary"
          aria-hidden
        >
          {memberInitials(previewName, member.email)}
        </span>
        <div className="min-w-0 flex-1">
          <p className="truncate text-base font-semibold">{previewName}</p>
          <p className="mt-0.5 truncate font-mono text-xs text-muted-foreground">{member.email}</p>
          <div className="mt-2 flex flex-wrap items-center gap-1.5">
            <span className="rounded-md border border-border/60 bg-background/40 px-2 py-0.5 font-mono text-[11px]">
              {formatMemberRoleLabel(roleCode, roleMeta?.name)}
            </span>
            {isInvited ? (
              <AdminStatusPill level="info" label="待激活" />
            ) : (
              <AdminStatusBadge status={status} />
            )}
          </div>
        </div>
        <UserIcon className="size-4 shrink-0 text-primary/50" aria-hidden />
      </div>
      <dl className="mt-3 grid gap-1 text-xs text-muted-foreground sm:grid-cols-2">
        <div>
          <dt className="inline text-muted-foreground/80">最近登录：</dt>
          <dd className="inline">
            {member.lastLoginAt ? formatAdminDate(member.lastLoginAt) : '—'}
          </dd>
        </div>
        <div>
          <dt className="inline text-muted-foreground/80">加入时间：</dt>
          <dd className="inline">{formatAdminDate(member.createdAt)}</dd>
        </div>
      </dl>
      {roleMeta ? (
        <p className="mt-2 text-xs text-muted-foreground">
          角色权限：{formatMemberRoleLabel(roleMeta.code, roleMeta.name)}
          {roleMeta.system ? ' · 系统内置' : ' · 自定义角色'}
        </p>
      ) : null}
    </div>
  )
}
