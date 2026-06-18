import { formatAdminDate } from '~/shared/ui/admin-status-badge'

export type TenantTrialPhase = 'none' | 'active' | 'expired'

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
