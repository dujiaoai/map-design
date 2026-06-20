import { SaaSRole } from '@repo/auth'
import { UserIcon } from 'lucide-react'

import { memberInitials } from '~/features/members/lib/member-role-labels'
import {
  formatUserRoleLabel,
  isPlatformAdminRole,
  PLATFORM_ADMIN_LABEL,
} from '~/features/users/lib/user-role-labels'
import type { AdminUserSummary } from '~/entities/user'
import { AdminStatusBadge, formatAdminDate } from '~/shared/ui/admin-status-badge'
import { AdminStatusPill } from '~/shared/ui/admin-status-pill'

export function EditUserPreview({
  user,
  displayName,
  status,
  platformAdmin,
}: {
  user: AdminUserSummary
  displayName: string
  status: 'active' | 'disabled'
  platformAdmin: boolean
}) {
  const previewName = displayName.trim() || user.displayName || user.email
  const isInvited = user.status === 'invited'
  const previewRoles = [
    ...(platformAdmin ? [PLATFORM_ADMIN_LABEL] : []),
    ...user.roles
      .filter((role) => role !== SaaSRole.PLATFORM_ADMIN)
      .map((role) => formatUserRoleLabel(role)),
  ]

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
          {memberInitials(previewName, user.email)}
        </span>
        <div className="min-w-0 flex-1">
          <p className="truncate text-base font-semibold">{previewName}</p>
          <p className="mt-0.5 truncate font-mono text-xs text-muted-foreground">{user.email}</p>
          <div className="mt-2 flex flex-wrap items-center gap-1.5">
            <span className="rounded-md border border-border/60 bg-background/40 px-2 py-0.5 font-mono text-[11px]">
              {user.tenantSlug}
            </span>
            {isInvited ? (
              <AdminStatusPill level="info" label="待激活" />
            ) : (
              <AdminStatusBadge status={status} />
            )}
            {platformAdmin || isPlatformAdminRole(user.roles) ? (
              <AdminStatusPill level="info" label="平台权限" />
            ) : null}
          </div>
        </div>
        <UserIcon className="size-4 shrink-0 text-primary/50" aria-hidden />
      </div>
      <dl className="mt-3 grid gap-1 text-xs text-muted-foreground sm:grid-cols-2">
        <div>
          <dt className="inline text-muted-foreground/80">最近登录：</dt>
          <dd className="inline">{user.lastLoginAt ? formatAdminDate(user.lastLoginAt) : '—'}</dd>
        </div>
        <div>
          <dt className="inline text-muted-foreground/80">创建时间：</dt>
          <dd className="inline">{formatAdminDate(user.createdAt)}</dd>
        </div>
        <div className="sm:col-span-2">
          <dt className="inline text-muted-foreground/80">租户：</dt>
          <dd className="inline">
            {user.tenantName} ({user.tenantSlug})
          </dd>
        </div>
      </dl>
      {previewRoles.length > 0 ? (
        <p className="mt-2 text-xs text-muted-foreground">
          角色：{previewRoles.join(' · ')}
        </p>
      ) : null}
    </div>
  )
}
