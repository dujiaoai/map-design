import { cn } from '@repo/ui'

import { describeMemberRole } from '~/features/members/lib/member-role-labels'
import type { AssignableRoleSummary } from '~/entities/tenant-role'

export function MemberRoleChipPicker({
  roles,
  value,
  onChange,
}: {
  roles: AssignableRoleSummary[]
  value: string
  onChange: (roleCode: string) => void
}) {
  if (roles.length === 0) {
    return <p className="text-xs text-muted-foreground">暂无可分配角色</p>
  }

  return (
    <div className="grid gap-2">
      {roles.map((role) => {
        const selected = value === role.code
        return (
          <button
            key={role.id}
            type="button"
            aria-pressed={selected}
            onClick={() => onChange(role.code)}
            className={cn(
              'admin-create-plan-chip relative z-10 cursor-pointer rounded-xl border px-3 py-3 text-left transition-all',
              selected
                ? 'border-primary/40 bg-primary/10 ring-1 ring-primary/25'
                : 'border-border/50 bg-background/20 hover:border-primary/25',
            )}
          >
            <p className="text-sm font-medium">
              {role.name}
              <span className="ml-2 font-mono text-[10px] text-muted-foreground">{role.code}</span>
            </p>
            <p className="mt-0.5 text-[11px] leading-relaxed text-muted-foreground">
              {describeMemberRole(role)}
            </p>
          </button>
        )
      })}
    </div>
  )
}
