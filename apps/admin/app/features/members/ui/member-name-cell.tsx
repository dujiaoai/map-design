import { cn } from '@repo/ui'

import { memberInitials } from '~/features/members/lib/member-role-labels'
import type { AdminUserSummary } from '~/entities/user'

export function MemberNameCell({ member }: { member: AdminUserSummary }) {
  const displayName = member.displayName.trim() || member.email
  const disabled = member.status === 'disabled'

  return (
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
        {memberInitials(displayName, member.email)}
      </span>
      <div className="min-w-0">
        <p className="truncate text-sm font-medium">{displayName}</p>
        <p className="mt-0.5 truncate font-mono text-[11px] text-muted-foreground">{member.email}</p>
      </div>
    </div>
  )
}
