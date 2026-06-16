import { describe, expect, it } from 'vitest'

import { buildAuditBillingLink, resolveAuditActionBillingTab } from './audit-log-billing-nav'

describe('resolveAuditActionBillingTab', () => {
  it('maps known billing audit actions to billing tabs', () => {
    expect(resolveAuditActionBillingTab('billing.wallet.adjust')).toBe('adjust')
    expect(resolveAuditActionBillingTab('billing.package.write')).toBe('packages')
    expect(resolveAuditActionBillingTab('billing.recharge.refund')).toBe('orders')
    expect(resolveAuditActionBillingTab('billing.coupon.write')).toBe('coupons')
    expect(resolveAuditActionBillingTab('billing.invoice.issue')).toBe('invoices')
    expect(resolveAuditActionBillingTab('billing.wire_transfer.approve')).toBe('wire-transfers')
  })

  it('returns null for non-billing actions', () => {
    expect(resolveAuditActionBillingTab('member.update')).toBeNull()
  })
})

describe('buildAuditBillingLink', () => {
  it('builds billing URL with tab and optional tenant filter', () => {
    expect(buildAuditBillingLink('billing.wallet.adjust')).toBe('/billing?tab=adjust')
    expect(buildAuditBillingLink('billing.recharge.refund', 'tenant-1')).toBe(
      '/billing?tab=orders&tenantId=tenant-1',
    )
  })

  it('returns null when action is not billing-related', () => {
    expect(buildAuditBillingLink('member.update')).toBeNull()
  })
})
