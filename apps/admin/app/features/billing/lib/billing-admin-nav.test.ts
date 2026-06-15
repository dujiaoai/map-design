import { describe, expect, it } from 'vitest'

import { BILLING_TAB_VALUES, parseBillingTab } from './billing-admin-nav'

describe('parseBillingTab', () => {
  it('returns valid tab from query value', () => {
    expect(parseBillingTab('ledger', 'overview')).toBe('ledger')
    expect(parseBillingTab('wallets', 'overview')).toBe('wallets')
  })

  it('falls back when tab is missing or invalid', () => {
    expect(parseBillingTab(null, 'orders')).toBe('orders')
    expect(parseBillingTab('unknown', 'usage')).toBe('usage')
  })
})

describe('BILLING_TAB_VALUES', () => {
  it('includes ledger, reconciliation and invoices tabs for admin read flow', () => {
    expect(BILLING_TAB_VALUES).toContain('ledger')
    expect(BILLING_TAB_VALUES).toContain('reconciliation')
    expect(BILLING_TAB_VALUES).toContain('invoices')
  })
})
