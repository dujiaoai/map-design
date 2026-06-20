import { cn } from '@repo/ui'
import { CircleDotIcon, MailIcon, ShieldOffIcon, UsersIcon } from 'lucide-react'

const STATUS_FILTERS = [
  { value: 'all', label: '全部', icon: UsersIcon },
  { value: 'active', label: '正常', icon: CircleDotIcon },
  { value: 'invited', label: '待激活', icon: MailIcon },
  { value: 'disabled', label: '已禁用', icon: ShieldOffIcon },
] as const

export function MembersStatusFilter({
  value,
  onChange,
}: {
  value: string
  onChange: (value: string) => void
}) {
  return (
    <div className="grid gap-2 sm:grid-cols-2 lg:grid-cols-4">
      {STATUS_FILTERS.map((filter) => {
        const Icon = filter.icon
        const active = value === filter.value
        const warn = filter.value === 'disabled' || filter.value === 'invited'

        return (
          <button
            key={filter.value}
            type="button"
            aria-pressed={active}
            onClick={() => onChange(filter.value)}
            className={cn(
              'admin-tenants-phase-chip flex items-center justify-between gap-2 rounded-xl border px-3 py-2.5 text-left transition-all',
              active
                ? 'border-primary/40 bg-primary/12 shadow-sm'
                : 'border-border/45 bg-background/25 hover:border-primary/25 hover:bg-primary/6',
              warn && !active ? 'admin-tenants-phase-warn' : null,
            )}
          >
            <span className="flex min-w-0 items-center gap-2">
              <Icon className="size-3.5 shrink-0 text-primary" aria-hidden />
              <span className="truncate text-xs font-medium">{filter.label}</span>
            </span>
          </button>
        )
      })}
    </div>
  )
}
