import { describe, expect, it } from 'vitest'

import {
  BILLING_TAB_VALUES,
  defaultBillingTabInGroup,
  parseBillingTab,
  resolveAccessibleBillingTab,
  resolveBillingGroup,
} from './billing-admin-nav'

const fullVisibility = {
  canRead: true,
  canAdjust: true,
  canWritePackages: true,
  canRefund: true,
}

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
  it('includes ledger, reconciliation, invoices and coupons tabs for admin read flow', () => {
    expect(BILLING_TAB_VALUES).toContain('ledger')
    expect(BILLING_TAB_VALUES).toContain('reconciliation')
    expect(BILLING_TAB_VALUES).toContain('invoices')
    expect(BILLING_TAB_VALUES).toContain('coupons')
    expect(BILLING_TAB_VALUES).toContain('wire-transfers')
  })
})

describe('billing groups', () => {
  it('maps tabs to groups', () => {
    expect(resolveBillingGroup('packages')).toBe('catalog')
    expect(resolveBillingGroup('wallets')).toBe('funds')
    expect(resolveBillingGroup('invoices')).toBe('operations')
  })

  it('defaults first visible tab in catalog group', () => {
    expect(defaultBillingTabInGroup('catalog', fullVisibility)).toBe('packages')
  })

  it('falls back when tab is not permitted', () => {
    expect(
      resolveAccessibleBillingTab('wallets', 'overview', {
        canRead: false,
        canAdjust: false,
        canWritePackages: true,
        canRefund: false,
      }),
    ).toBe('packages')
  })
})
