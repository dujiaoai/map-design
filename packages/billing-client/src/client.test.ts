import { describe, expect, it, vi } from 'vitest'

import { createBillingClient } from './client'

describe('createBillingClient', () => {
  it('getWallet parses response', async () => {
    const fetchFn = vi.fn(async () =>
      Response.json({
        walletId: 'w1',
        balance: 500,
        frozenBalance: 0,
        availableBalance: 500,
      }),
    )

    const client = createBillingClient({
      baseUrl: 'http://billing.test',
      fetch: fetchFn,
    })

    const wallet = await client.getWallet()

    expect(wallet.balance).toBe(500)
    expect(fetchFn).toHaveBeenCalledWith(
      'http://billing.test/wallet',
      expect.objectContaining({ method: 'GET' }),
    )
  })

  it('createRechargeOrder posts packageCode and default channel', async () => {
    const fetchFn = vi.fn(async (_url, init) => {
      expect(init?.method).toBe('POST')
      expect(JSON.parse(String(init?.body))).toEqual({
        packageCode: 'starter_500',
        channel: 'mock',
      })
      return Response.json({
        orderNo: 'RO-1',
        status: 'pending',
        channel: 'mock',
        points: 500,
        priceCents: 4900,
        currency: 'CNY',
        walletBalance: 500,
      })
    })

    const client = createBillingClient({
      baseUrl: 'http://billing.test',
      fetch: fetchFn,
    })

    const order = await client.createRechargeOrder({ packageCode: 'starter_500' })

    expect(order.orderNo).toBe('RO-1')
  })

  it('transfer posts payload', async () => {
    const fetchFn = vi.fn(async (_url, init) => {
      expect(init?.method).toBe('POST')
      expect(JSON.parse(String(init?.body))).toEqual({
        toUserId: '00000000-0000-0000-0000-000000000002',
        amount: 100,
        remark: 'team allocation',
        idempotencyKey: 'transfer:test',
      })
      return Response.json({
        fromWalletId: 'w1',
        toWalletId: 'w2',
        fromUserId: 'u1',
        toUserId: '00000000-0000-0000-0000-000000000002',
        amount: 100,
        fromBalanceAfter: 900,
        toBalanceAfter: 100,
        remark: 'team allocation',
        idempotentReplay: false,
      })
    })

    const client = createBillingClient({
      baseUrl: 'http://billing.test',
      fetch: fetchFn,
    })

    const result = await client.transfer({
      toUserId: '00000000-0000-0000-0000-000000000002',
      amount: 100,
      remark: 'team allocation',
      idempotencyKey: 'transfer:test',
    })

    expect(result.amount).toBe(100)
  })
})
