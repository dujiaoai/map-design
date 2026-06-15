import type { BillingTab } from '~/features/billing/lib/billing-admin-nav'

const BILLING_ACTION_TABS: Record<string, BillingTab> = {
  'billing.wallet.adjust': 'adjust',
  'billing.package.write': 'packages',
  'billing.recharge.refund': 'orders',
}

export function resolveAuditActionBillingTab(action: string): BillingTab | null {
  return BILLING_ACTION_TABS[action] ?? null
}

export function buildAuditBillingLink(
  action: string,
  targetTenantId?: string | null,
): string | null {
  const tab = resolveAuditActionBillingTab(action)
  if (!tab) return null

  const params = new URLSearchParams({ tab })
  if (targetTenantId?.trim()) {
    params.set('tenantId', targetTenantId.trim())
  }
  return `/billing?${params.toString()}`
}
