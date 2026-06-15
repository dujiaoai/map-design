import { describe, expect, it } from 'vitest'

import {
  formatLedgerEntryType,
  formatLedgerRemark,
  formatLedgerSignedAmount,
} from './ledger-labels'

describe('formatLedgerEntryType', () => {
  it('maps known entry types', () => {
    expect(formatLedgerEntryType('recharge')).toBe('充值')
    expect(formatLedgerEntryType('coupon')).toBe('优惠券')
    expect(formatLedgerEntryType('debit')).toBe('扣费')
  })

  it('falls back to raw entry type', () => {
    expect(formatLedgerEntryType('custom')).toBe('custom')
  })
})

describe('formatLedgerRemark', () => {
  it('maps signup bonus, recharge and coupon remarks', () => {
    expect(formatLedgerRemark('signup_bonus')).toBe('注册体验积分')
    expect(formatLedgerRemark('recharge:RO-123')).toBe('在线充值')
    expect(formatLedgerRemark('coupon:WELCOME100')).toBe('优惠券 WELCOME100')
  })

  it('returns dash for empty remark', () => {
    expect(formatLedgerRemark(null)).toBe('—')
  })
})

describe('formatLedgerSignedAmount', () => {
  it('formats debit and transfer_out as negative', () => {
    expect(formatLedgerSignedAmount('debit', 10)).toBe('−10')
    expect(formatLedgerSignedAmount('transfer_out', 25)).toBe('−25')
  })

  it('prefixes positive credits with plus', () => {
    expect(formatLedgerSignedAmount('recharge', 100)).toBe('+100')
  })
})
