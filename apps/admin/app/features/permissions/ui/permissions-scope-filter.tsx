import { cn } from '@repo/ui'
import { BuildingIcon, GlobeIcon, LayersIcon, ShieldIcon } from 'lucide-react'

import { PERMISSION_SCOPE_LABELS } from '~/features/permissions/lib/permission-module-labels'
import type { AdminPermissionModule } from '~/shared/api/admin-api'

const SCOPE_FILTERS = [
  { value: 'all', label: '全部', icon: ShieldIcon },
  { value: 'platform', label: PERMISSION_SCOPE_LABELS.platform, icon: GlobeIcon },
  { value: 'tenant', label: PERMISSION_SCOPE_LABELS.tenant, icon: BuildingIcon },
  { value: 'workspace', label: PERMISSION_SCOPE_LABELS.workspace, icon: LayersIcon },
] as const

export function PermissionsScopeFilter({
  value,
  onChange,
}: {
  value: string
  onChange: (value: string) => void
}) {
  return (
    <div className="grid gap-2 sm:grid-cols-2 lg:grid-cols-4">
      {SCOPE_FILTERS.map((filter) => {
        const Icon = filter.icon
        const active = value === filter.value

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

export function matchesModuleScopeFilter(
  module: AdminPermissionModule,
  filter: string,
): boolean {
  if (filter === 'all') return true
  return module.scope === filter
}
