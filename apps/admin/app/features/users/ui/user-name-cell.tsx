import { cn } from '@repo/ui'
import { Link } from 'react-router'

import { memberInitials } from '~/features/members/lib/member-role-labels'
import type { AdminUserSummary } from '~/entities/user'

export function UserNameCell({
  user,
  tenantFilterId,
}: {
  user: AdminUserSummary
  tenantFilterId?: string
}) {
  const displayName = user.displayName.trim() || user.email
  const disabled = user.status === 'disabled'

  const content = (
    <div className="flex min-w-[12rem] items-center gap-3">
      <span
        className={cn(
          'admin-tenant-avatar flex size-9 shrink-0 items-center justify-center rounded-lg border text-xs font-semibold',
          disabled
            ? 'border-border/50 bg-muted/30 text-muted-foreground'
            : 'border-primary/25 bg-primary/10 text-primary',
        )}
        aria-hidden
      >
        {memberInitials(displayName, user.email)}
      </span>
      <div className="min-w-0">
        <p className="truncate text-sm font-medium">{displayName}</p>
        <p className="mt-0.5 truncate font-mono text-[11px] text-muted-foreground">{user.email}</p>
      </div>
    </div>
  )

  if (!tenantFilterId) {
    return (
      <Link
        to={`/users?tenantId=${encodeURIComponent(user.tenantId)}`}
        className="block transition-opacity hover:opacity-90"
      >
        {content}
      </Link>
    )
  }

  return content
}
