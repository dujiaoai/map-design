import { describe, expect, it } from 'vitest'

import {
  isRechargeOrderSettled,
  rechargeOrderPollInterval,
  RECHARGE_ORDER_POLL_MS,
} from './recharge-order-poll-interval'

describe('recharge-order-poll-interval', () => {
  it('polls while pending', () => {
    expect(rechargeOrderPollInterval('pending')).toBe(RECHARGE_ORDER_POLL_MS)
    expect(rechargeOrderPollInterval(undefined)).toBe(RECHARGE_ORDER_POLL_MS)
  })

  it('stops polling when settled', () => {
    expect(isRechargeOrderSettled('paid')).toBe(true)
    expect(rechargeOrderPollInterval('paid')).toBe(false)
    expect(rechargeOrderPollInterval('expired')).toBe(false)
  })
})
