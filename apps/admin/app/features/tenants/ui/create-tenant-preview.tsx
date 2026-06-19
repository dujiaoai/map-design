import { Building2Icon } from 'lucide-react'

import {
  describeTrialPreset,
  TENANT_PLAN_OPTIONS,
  type TenantTrialPreset,
} from '~/features/tenants/lib/tenant-create-options'
import { tenantInitials } from '~/features/tenants/lib/tenant-slug'
import { AdminStatusPill } from '~/shared/ui/admin-status-pill'

export function CreateTenantPreview({
  name,
  slug,
  plan,
  trialPreset,
  trialEndsAtDate,
}: {
  name: string
  slug: string
  plan: string
  trialPreset: TenantTrialPreset
  trialEndsAtDate: string
}) {
  const displayName = name.trim() || '新租户'
  const displaySlug = slug.trim() || 'tenant-slug'
  const planMeta = TENANT_PLAN_OPTIONS.find((item) => item.value === plan)
  const lifecycle =
    trialPreset === 'none' ? '正式' : trialEndsAtDate || trialPreset !== 'custom' ? '试用中' : '待设置试用'

  return (
    <div className="admin-create-tenant-preview rounded-xl border border-primary/25 bg-primary/6 p-4">
      <p className="admin-display text-[10px] tracking-[0.2em] text-primary/70 uppercase">
        Live Preview
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
          <p className="mt-0.5 truncate font-mono text-xs text-muted-foreground">{displaySlug}</p>
          <div className="mt-2 flex flex-wrap items-center gap-1.5">
            <span className="rounded-md border border-border/60 bg-background/40 px-2 py-0.5 font-mono text-[11px]">
              {(planMeta?.label ?? plan) || 'free'}
            </span>
            <AdminStatusPill
              level={trialPreset === 'none' ? 'ok' : 'info'}
              label={lifecycle}
            />
          </div>
        </div>
        <Building2Icon className="size-4 shrink-0 text-primary/50" aria-hidden />
      </div>
      <p className="mt-3 text-xs text-muted-foreground">
        {planMeta?.description ?? '订阅计划将决定默认配额与计费策略。'}
      </p>
      <p className="mt-1 text-xs text-muted-foreground">
        生命周期：{describeTrialPreset(trialPreset, trialEndsAtDate)}
      </p>
    </div>
  )
}
