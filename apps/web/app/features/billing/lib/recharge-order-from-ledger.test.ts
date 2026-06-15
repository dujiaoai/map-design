import { describe, expect, it } from 'vitest'

import {
  extractRechargeOrderNosFromLedger,
  parseRechargeOrderNoFromRemark,
} from './recharge-order-from-ledger'

describe('parseRechargeOrderNoFromRemark', () => {
  it('extracts order no from recharge remark', () => {
    expect(parseRechargeOrderNoFromRemark('recharge:RO-ABC123')).toBe('RO-ABC123')
  })

  it('returns null for non-recharge remarks', () => {
    expect(parseRechargeOrderNoFromRemark('signup_bonus')).toBeNull()
    expect(parseRechargeOrderNoFromRemark(undefined)).toBeNull()
  })
})

describe('extractRechargeOrderNosFromLedger', () => {
  it('dedupes recharge entries by order no', () => {
    const orderNos = extractRechargeOrderNosFromLedger([
      {
        id: '1',
        entryType: 'recharge',
        amount: 500,
        balanceAfter: 500,
        remark: 'recharge:RO-ONE',
        createdAt: '2026-01-01T00:00:00Z',
      },
      {
        id: '2',
        entryType: 'recharge',
        amount: 500,
        balanceAfter: 1000,
        remark: 'recharge:RO-TWO',
        createdAt: '2026-01-02T00:00:00Z',
      },
      {
        id: '3',
        entryType: 'debit',
        amount: 1,
        balanceAfter: 999,
        remark: 'billing.smoke.consume',
        createdAt: '2026-01-03T00:00:00Z',
      },
    ])
    expect(orderNos).toEqual(['RO-ONE', 'RO-TWO'])
  })
})
