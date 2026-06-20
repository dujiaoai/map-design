import { Building2Icon } from 'lucide-react'

import {
  describeTrialPreset,
  planOptionsForTenant,
  resolveCreateTrialEndsAt,
  type TenantTrialPreset,
} from '~/features/tenants/lib/tenant-create-options'
import { resolveOnboardingPhase, TENANT_ONBOARDING_LABELS } from '~/features/tenants/lib/tenant-lifecycle'
import { tenantInitials } from '~/features/tenants/lib/tenant-slug'
import type { AdminTenantSummary } from '~/entities/tenant'
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

export function EditTenantPreview({
  tenant,
  name,
  plan,
  status,
  trialPreset,
  trialEndsAtDate,
}: {
  tenant: AdminTenantSummary
  name: string
  plan: string
  status: 'active' | 'suspended'
  trialPreset: TenantTrialPreset
  trialEndsAtDate: string
}) {
  const displayName = name.trim() || tenant.name
  const planOptions = planOptionsForTenant(tenant.plan)
  const planMeta = planOptions.find((item) => item.value === plan)
  const previewTrialEndsAt =
    trialPreset === 'none' ? null : resolveCreateTrialEndsAt(trialPreset, trialEndsAtDate)
  const onboardingPhase = resolveOnboardingPhase({
    status,
    trialEndsAt: previewTrialEndsAt,
  })

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
          {tenantInitials(displayName)}
        </span>
        <div className="min-w-0 flex-1">
          <p className="truncate text-base font-semibold">{displayName}</p>
          <p className="mt-0.5 truncate font-mono text-xs text-muted-foreground">{tenant.slug}</p>
          <div className="mt-2 flex flex-wrap items-center gap-1.5">
            <span className="rounded-md border border-border/60 bg-background/40 px-2 py-0.5 font-mono text-[11px]">
              {(planMeta?.label ?? plan) || tenant.plan}
            </span>
            <AdminStatusPill
              level={ONBOARDING_PILL_LEVEL[onboardingPhase]}
              label={TENANT_ONBOARDING_LABELS[onboardingPhase]}
            />
            <AdminStatusBadge status={status} />
          </div>
        </div>
        <Building2Icon className="size-4 shrink-0 text-primary/50" aria-hidden />
      </div>
      <dl className="mt-3 grid gap-1 text-xs text-muted-foreground sm:grid-cols-2">
        <div>
          <dt className="inline text-muted-foreground/80">租户 ID：</dt>
          <dd className="inline font-mono">{tenant.id}</dd>
        </div>
        <div>
          <dt className="inline text-muted-foreground/80">创建于：</dt>
          <dd className="inline">{formatAdminDate(tenant.createdAt)}</dd>
        </div>
      </dl>
      <p className="mt-2 text-xs text-muted-foreground">
        {planMeta?.description ?? '订阅计划将决定默认配额与计费策略。'}
      </p>
      <p className="mt-1 text-xs text-muted-foreground">
        生命周期：{describeTrialPreset(trialPreset, trialEndsAtDate)}
      </p>
    </div>
  )
}
