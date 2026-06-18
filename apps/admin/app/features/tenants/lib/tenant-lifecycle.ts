import { formatAdminDate } from '~/shared/ui/admin-status-badge'

import type { AdminTenantSummary } from '~/entities/tenant'

export type TenantTrialPhase = 'none' | 'active' | 'expired'

export type TenantOnboardingPhase = 'active' | 'trial' | 'trial_expired' | 'suspended'

export const TENANT_ONBOARDING_LABELS: Record<TenantOnboardingPhase, string> = {
  active: '正式',
  trial: '试用中',
  trial_expired: '试用到期',
  suspended: '已停用',
}

export function resolveOnboardingPhase(
  tenant: Pick<AdminTenantSummary, 'status' | 'trialEndsAt' | 'onboardingPhase'>,
  nowMs = Date.now(),
): TenantOnboardingPhase {
  if (tenant.onboardingPhase) return tenant.onboardingPhase
  if (tenant.status === 'suspended') return 'suspended'
  if (tenant.trialEndsAt != null) {
    return nowMs > tenant.trialEndsAt ? 'trial_expired' : 'trial'
  }
  return 'active'
}

export function resolveTenantTrialPhase(
  trialEndsAt: number | null | undefined,
  nowMs = Date.now(),
): TenantTrialPhase {
  if (trialEndsAt == null) return 'none'
  return nowMs > trialEndsAt ? 'expired' : 'active'
}

export function formatTenantTrialEndsAt(trialEndsAt: number | null | undefined): string {
  if (trialEndsAt == null) return '—'
  return formatAdminDate(trialEndsAt)
}

export function tenantTrialLabel(trialEndsAt: number | null | undefined): string | null {
  const phase = resolveTenantTrialPhase(trialEndsAt)
  if (phase === 'none') return null
  return phase === 'expired' ? '试用已到期' : '试用中'
}

/** AdminAntDate YYYY-MM-DD → 当日结束 epoch ms */
export function trialDateToEpochMs(date: string): number | null {
  if (!date.trim()) return null
  return new Date(`${date}T23:59:59.999`).getTime()
}

export function trialEpochMsToDate(trialEndsAt: number | null | undefined): string {
  if (trialEndsAt == null) return ''
  const date = new Date(trialEndsAt)
  const year = date.getFullYear()
  const month = String(date.getMonth() + 1).padStart(2, '0')
  const day = String(date.getDate()).padStart(2, '0')
  return `${year}-${month}-${day}`
}
