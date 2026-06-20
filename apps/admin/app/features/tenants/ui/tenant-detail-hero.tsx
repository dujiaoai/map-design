import { Button, cn, toast } from '@repo/ui'
import { Building2Icon, CopyIcon } from 'lucide-react'
import type { ReactNode } from 'react'

import {
  describeTenantPlan,
  formatTenantPlanLabel,
} from '~/features/tenants/lib/tenant-create-options'
import {
  formatTenantTrialEndsAt,
  resolveOnboardingPhase,
  TENANT_ONBOARDING_LABELS,
} from '~/features/tenants/lib/tenant-lifecycle'
import { tenantInitials } from '~/features/tenants/lib/tenant-slug'
import type { AdminTenantSummary } from '~/entities/tenant'
import { AdminIdCell } from '~/shared/ui/admin-id-cell'
import { AdminStatusBadge, formatAdminDate } from '~/shared/ui/admin-status-badge'
import { AdminStatusPill } from '~/shared/ui/admin-status-pill'

const ONBOARDING_PILL_LEVEL: Record<
  ReturnType<typeof resolveOnboardingPhase>,
  'ok' | 'info' | 'warn' | 'off'
> = {
  active: 'ok',
  trial: 'info',
  trial_expired: 'warn',
  suspended: 'off',
}

export function TenantDetailHero({
  tenant,
  actions,
}: {
  tenant: AdminTenantSummary
  actions?: ReactNode
}) {
  const onboardingPhase = resolveOnboardingPhase(tenant)
  const suspended = tenant.status === 'suspended'

  async function copySlug() {
    try {
      await navigator.clipboard.writeText(tenant.slug)
      toast.success('Slug 已复制')
    } catch {
      toast.error('复制失败')
    }
  }

  return (
    <div className="admin-create-tenant-preview rounded-xl border border-primary/25 bg-primary/6 p-4 md:p-5">
      <div className="flex flex-wrap items-start justify-between gap-4">
        <p className="admin-display w-full text-[10px] tracking-[0.2em] text-primary/70 uppercase sm:w-auto">
          Tenant Profile
        </p>
        {actions ? <div className="flex flex-wrap gap-2">{actions}</div> : null}
      </div>

      <div className="mt-3 flex items-start gap-3">
        <span
          className={cn(
            'admin-tenant-avatar flex size-12 shrink-0 items-center justify-center rounded-xl border text-sm font-semibold',
            suspended
              ? 'border-border/50 bg-muted/30 text-muted-foreground'
              : 'border-primary/30 bg-primary/12 text-primary',
          )}
          aria-hidden
        >
          {tenantInitials(tenant.name)}
        </span>
        <div className="min-w-0 flex-1">
          <p className="truncate text-lg font-semibold">{tenant.name}</p>
          <div className="mt-0.5 flex items-center gap-1">
            <p className="truncate font-mono text-xs text-muted-foreground">{tenant.slug}</p>
            <Button
              type="button"
              variant="ghost"
              size="icon-sm"
              className="size-6 shrink-0 text-muted-foreground hover:text-foreground"
              aria-label={`复制 slug ${tenant.slug}`}
              onClick={() => void copySlug()}
            >
              <CopyIcon className="size-3" />
            </Button>
          </div>
          <div className="mt-2 flex flex-wrap items-center gap-1.5">
            <span className="rounded-md border border-border/60 bg-background/40 px-2 py-0.5 font-mono text-[11px]">
              {formatTenantPlanLabel(tenant.plan)}
            </span>
            <AdminStatusPill
              level={ONBOARDING_PILL_LEVEL[onboardingPhase]}
              label={TENANT_ONBOARDING_LABELS[onboardingPhase]}
            />
            <AdminStatusBadge status={tenant.status} />
          </div>
        </div>
        <Building2Icon className="size-4 shrink-0 text-primary/50" aria-hidden />
      </div>

      <dl className="mt-4 grid gap-2 text-xs text-muted-foreground sm:grid-cols-2">
        <div>
          <dt className="text-muted-foreground/80">租户 ID</dt>
          <dd className="mt-0.5">
            <AdminIdCell value={tenant.id} label="租户 ID" />
          </dd>
        </div>
        <div>
          <dt className="text-muted-foreground/80">创建时间</dt>
          <dd className="mt-0.5">{formatAdminDate(tenant.createdAt)}</dd>
        </div>
        <div>
          <dt className="text-muted-foreground/80">试用截止</dt>
          <dd className="mt-0.5">{formatTenantTrialEndsAt(tenant.trialEndsAt)}</dd>
        </div>
        <div>
          <dt className="text-muted-foreground/80">生命周期</dt>
          <dd className="mt-0.5">{TENANT_ONBOARDING_LABELS[onboardingPhase]}</dd>
        </div>
      </dl>

      <p className="mt-3 text-xs leading-relaxed text-muted-foreground">
        {describeTenantPlan(tenant.plan)}
      </p>
    </div>
  )
}
