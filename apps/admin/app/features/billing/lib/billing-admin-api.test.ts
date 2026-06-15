import { describe, expect, it } from 'vitest'

import {
  adminBillingLedgerQuery,
  adminBillingReconciliationQuery,
  adminBillingWalletsQuery,
  adminLedgerListSchema,
  adminReconciliationDailySchema,
  adminWalletListSchema,
  defaultReconciliationDateUtc,
} from './billing-admin-api'

describe('adminBillingWalletsQuery', () => {
  it('builds query string with pagination defaults', () => {
    expect(adminBillingWalletsQuery({})).toBe('?page=0&size=20')
  })

  it('includes tenant and user filters when provided', () => {
    const query = adminBillingWalletsQuery({
      tenantId: '11111111-1111-1111-1111-111111111111',
      userId: '22222222-2222-2222-2222-222222222222',
      page: 1,
      size: 10,
    })
    expect(query).toContain('tenantId=11111111-1111-1111-1111-111111111111')
    expect(query).toContain('userId=22222222-2222-2222-2222-222222222222')
    expect(query).toContain('page=1')
    expect(query).toContain('size=10')
  })
})

describe('adminBillingLedgerQuery', () => {
  it('omits empty optional filters', () => {
    expect(adminBillingLedgerQuery({ page: 0, size: 20 })).toBe('?page=0&size=20')
  })

  it('includes entryType when filtering ledger', () => {
    const query = adminBillingLedgerQuery({
      userId: '22222222-2222-2222-2222-222222222222',
      entryType: 'adjust',
    })
    expect(query).toContain('entryType=adjust')
    expect(query).toContain('userId=22222222-2222-2222-2222-222222222222')
  })
})

describe('adminBillingReconciliationQuery', () => {
  it('includes date when provided', () => {
    expect(adminBillingReconciliationQuery({ date: '2026-06-14' })).toBe('?date=2026-06-14')
  })

  it('returns empty query when date omitted', () => {
    expect(adminBillingReconciliationQuery({})).toBe('')
  })
})

describe('defaultReconciliationDateUtc', () => {
  it('returns YYYY-MM-DD', () => {
    expect(defaultReconciliationDateUtc()).toMatch(/^\d{4}-\d{2}-\d{2}$/)
  })
})

describe('admin response schemas', () => {
  it('parses wallet list payload', () => {
    const parsed = adminWalletListSchema.parse({
      items: [
        {
          walletId: 'w1',
          tenantId: 't1',
          userId: 'u1',
          balance: 100,
          frozenBalance: 10,
          availableBalance: 90,
        },
      ],
      page: 0,
      size: 20,
      total: 1,
    })
    expect(parsed.items[0]?.availableBalance).toBe(90)
  })

  it('parses ledger list payload', () => {
    const parsed = adminLedgerListSchema.parse({
      items: [
        {
          id: 'l1',
          walletId: 'w1',
          tenantId: 't1',
          userId: 'u1',
          entryType: 'adjust',
          amount: 50,
          balanceAfter: 150,
          productCode: 'platform-admin',
          remark: 'gift',
          createdAt: '2026-01-01T00:00:00Z',
        },
      ],
      page: 0,
      size: 20,
      total: 1,
    })
    expect(parsed.items[0]?.entryType).toBe('adjust')
  })

  it('parses reconciliation daily payload', () => {
    const parsed = adminReconciliationDailySchema.parse({
      date: '2026-06-14',
      from: '2026-06-14T00:00:00Z',
      to: '2026-06-15T00:00:00Z',
      paidOrderCount: 1,
      paidOrderPoints: 500,
      paidOrderGmvCents: 4900,
      rechargeLedgerCount: 1,
      rechargeLedgerPoints: 500,
      refundedOrderCount: 0,
      refundedOrderPoints: 0,
      refundedOrderGmvCents: 0,
      refundLedgerCount: 0,
      refundLedgerPoints: 0,
      balanced: true,
      discrepancies: [],
    })
    expect(parsed.balanced).toBe(true)
  })
})
