import { cn } from '@repo/ui'
import { useQuery } from '@tanstack/react-query'
import {
  Building2Icon,
  PauseCircleIcon,
  SparklesIcon,
  TimerIcon,
  UsersIcon,
} from 'lucide-react'

import type { TenantOnboardingPhase } from '~/entities/tenant/model'
import { TENANT_ONBOARDING_LABELS } from '~/features/tenants/lib/tenant-lifecycle'
import { fetchAdminStats } from '~/shared/api/admin-api'
import { adminQueryKeys } from '~/shared/lib/admin-query-keys'

const PHASE_ORDER: TenantOnboardingPhase[] = [
  'active',
  'trial',
  'trial_expired',
  'suspended',
]

const PHASE_ICONS = {
  active: SparklesIcon,
  trial: TimerIcon,
  trial_expired: TimerIcon,
  suspended: PauseCircleIcon,
} as const

export function TenantsOverviewStrip({
  activePhase,
  onPhaseClick,
}: {
  activePhase: string
  onPhaseClick: (phase: TenantOnboardingPhase | 'all') => void
}) {
  const statsQuery = useQuery({
    queryKey: adminQueryKeys.stats,
    queryFn: fetchAdminStats,
    staleTime: 60_000,
  })

  const stats = statsQuery.data
  const loading = statsQuery.isLoading

  const phaseCounts: Record<TenantOnboardingPhase, number> = {
    active: Math.max(
      0,
      (stats?.tenantCount ?? 0) -
        (stats?.suspendedTenantCount ?? 0) -
        (stats?.trialActiveTenantCount ?? 0) -
        (stats?.trialExpiredTenantCount ?? 0),
    ),
    trial: stats?.trialActiveTenantCount ?? 0,
    trial_expired: stats?.trialExpiredTenantCount ?? 0,
    suspended: stats?.suspendedTenantCount ?? 0,
  }

  return (
    <section className="admin-tenants-strip admin-health-strip px-4 py-5 md:px-6 md:py-6">
      <div className="relative flex flex-wrap items-start justify-between gap-4">
        <div>
          <p className="admin-display text-xs tracking-[0.22em] text-primary/75 uppercase">
            Tenant Registry
          </p>
          <p className="mt-1 text-sm text-muted-foreground">
            全平台租户生命周期分布；点击阶段可快速筛选列表。
          </p>
        </div>
        <div className="admin-tenants-strip-total rounded-xl border border-border/50 bg-background/30 px-4 py-2.5 text-right">
          <p className="text-xs text-muted-foreground">租户总数</p>
          <p className="admin-display text-2xl font-semibold tabular-nums">
            {loading ? (
              <span className="inline-block h-7 w-10 animate-pulse rounded bg-muted/50" />
            ) : (
              stats?.tenantCount ?? 0
            )}
          </p>
        </div>
      </div>

      <div className="relative mt-4 grid gap-2 sm:grid-cols-2 lg:grid-cols-5">
        <PhaseChip
          icon={Building2Icon}
          label="全部"
          count={stats?.tenantCount}
          loading={loading}
          active={activePhase === 'all'}
          onClick={() => onPhaseClick('all')}
        />
        {PHASE_ORDER.map((phase) => (
          <PhaseChip
            key={phase}
            icon={PHASE_ICONS[phase]}
            label={TENANT_ONBOARDING_LABELS[phase]}
            count={phaseCounts[phase]}
            loading={loading}
            active={activePhase === phase}
            tone={phase}
            onClick={() => onPhaseClick(phase)}
          />
        ))}
      </div>

      {!loading && stats ? (
        <p className="relative mt-3 flex flex-wrap items-center gap-x-4 gap-y-1 text-xs text-muted-foreground">
          <span className="inline-flex items-center gap-1.5">
            <UsersIcon className="size-3.5 text-primary" aria-hidden />
            平台用户 {stats.userCount}
          </span>
          <span>近 7 日活跃租户 {stats.activeTenantsLast7Days}</span>
          <span>近 7 日新增用户 {stats.newUsersLast7Days}</span>
        </p>
      ) : null}
    </section>
  )
}

function PhaseChip({
  icon: Icon,
  label,
  count,
  loading,
  active,
  tone,
  onClick,
}: {
  icon: typeof Building2Icon
  label: string
  count?: number
  loading: boolean
  active: boolean
  tone?: TenantOnboardingPhase
  onClick: () => void
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={cn(
        'admin-tenants-phase-chip flex items-center justify-between gap-2 rounded-xl border px-3 py-2.5 text-left transition-all',
        active
          ? 'border-primary/40 bg-primary/12 shadow-sm'
          : 'border-border/45 bg-background/25 hover:border-primary/25 hover:bg-primary/6',
        tone === 'trial_expired' || tone === 'suspended' ? 'admin-tenants-phase-warn' : null,
      )}
    >
      <span className="flex min-w-0 items-center gap-2">
        <Icon className="size-3.5 shrink-0 text-primary" aria-hidden />
        <span className="truncate text-xs font-medium">{label}</span>
      </span>
      <span className="admin-display shrink-0 text-sm font-semibold tabular-nums">
        {loading ? '—' : (count ?? 0)}
      </span>
    </button>
  )
}
