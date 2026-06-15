export type BillingTab =
  | 'overview'
  | 'packages'
  | 'coupons'
  | 'wallets'
  | 'ledger'
  | 'reconciliation'
  | 'invoices'
  | 'orders'
  | 'usage'
  | 'adjust'

export const BILLING_TAB_VALUES: BillingTab[] = [
  'overview',
  'packages',
  'coupons',
  'wallets',
  'ledger',
  'reconciliation',
  'invoices',
  'orders',
  'usage',
  'adjust',
]

export type BillingNavigateTarget = {
  tab: BillingTab
  tenantId?: string
  userId?: string
}

export function parseBillingTab(value: string | null, fallback: BillingTab): BillingTab {
  if (value && BILLING_TAB_VALUES.includes(value as BillingTab)) {
    return value as BillingTab
  }
  return fallback
}
