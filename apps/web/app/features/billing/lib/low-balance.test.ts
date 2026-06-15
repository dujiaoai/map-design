import { describe, expect, it } from 'vitest'

import { isLowBalance, LOW_BALANCE_THRESHOLD } from './low-balance'

describe('isLowBalance', () => {
  it('returns true when available balance is below threshold', () => {
    expect(isLowBalance(LOW_BALANCE_THRESHOLD - 1)).toBe(true)
    expect(isLowBalance(0)).toBe(true)
  })

  it('returns false at or above threshold', () => {
    expect(isLowBalance(LOW_BALANCE_THRESHOLD)).toBe(false)
    expect(isLowBalance(LOW_BALANCE_THRESHOLD + 100)).toBe(false)
  })

  it('returns false for negative balances', () => {
    expect(isLowBalance(-1)).toBe(false)
  })
})
