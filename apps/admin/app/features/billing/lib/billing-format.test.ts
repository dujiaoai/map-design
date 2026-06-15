import { describe, expect, it } from 'vitest'

import {
  formatBillingPrice,
  formatLedgerAmount,
  formatLedgerEntryType,
  LEDGER_ENTRY_TYPE_OPTIONS,
} from './billing-format'

describe('formatBillingPrice', () => {
  it('formats CNY with two decimals', () => {
    expect(formatBillingPrice(4900, 'CNY')).toBe('¥49.00')
  })

  it('falls back to cents + currency for non-CNY', () => {
    expect(formatBillingPrice(100, 'USD')).toBe('100 USD')
  })
})

describe('formatLedgerEntryType', () => {
  it('maps known entry types to Chinese labels', () => {
    expect(formatLedgerEntryType('recharge')).toBe('充值')
    expect(formatLedgerEntryType('debit')).toBe('扣费')
  })

  it('returns raw type for unknown values', () => {
    expect(formatLedgerEntryType('custom_type')).toBe('custom_type')
  })
})

describe('formatLedgerAmount', () => {
  it('prefixes positive amounts with plus', () => {
    expect(formatLedgerAmount(120)).toBe('+120')
  })

  it('keeps negative amounts as-is', () => {
    expect(formatLedgerAmount(-50)).toBe('-50')
  })
})

describe('LEDGER_ENTRY_TYPE_OPTIONS', () => {
  it('includes an all-types option first', () => {
    expect(LEDGER_ENTRY_TYPE_OPTIONS[0]?.value).toBe('all')
  })
})
