import { describe, expect, it, vi } from 'vitest'

import { createApiClient } from './client'
import { ApiError } from './types'

describe('createApiClient', () => {
  it('GET 附带 Bearer token', async () => {
    const fetchMock = vi.fn(async () => new Response(JSON.stringify({ ok: true }), { status: 200 }))

    const client = createApiClient({
      baseUrl: 'https://api.test/v1',
      fetch: fetchMock,
      auth: { getAccessToken: () => 'token-abc' },
    })

    await client.get('/users/me')

    expect(fetchMock).toHaveBeenCalledOnce()
    const call = fetchMock.mock.calls[0]
    expect(call).toBeDefined()
    const init = call?.[1] as RequestInit | undefined
    expect(new Headers(init?.headers).get('Authorization')).toBe('Bearer token-abc')
  })

  it('401 时尝试 refresh 并重试一次', async () => {
    const fetchMock = vi
      .fn()
      .mockResolvedValueOnce(new Response('unauthorized', { status: 401 }))
      .mockResolvedValueOnce(new Response(JSON.stringify({ id: 1 }), { status: 200 }))

    const refresh = vi.fn(async () => 'new-token')

    const client = createApiClient({
      baseUrl: 'https://api.test/v1',
      fetch: fetchMock,
      auth: {
        getAccessToken: () => 'old-token',
        refreshAccessToken: refresh,
      },
    })

    const data = await client.get<{ id: number }>('/profile')
    expect(data.id).toBe(1)
    expect(refresh).toHaveBeenCalledOnce()
    expect(fetchMock).toHaveBeenCalledTimes(2)
  })

  it('非 2xx 抛出 ApiError', async () => {
    const client = createApiClient({
      baseUrl: 'https://api.test/v1',
      fetch: async () => new Response(JSON.stringify({ message: 'bad' }), { status: 400 }),
    })

    await expect(client.get('/x')).rejects.toBeInstanceOf(ApiError)
  })

  it('402 余额不足时触发 onPaymentRequired 并仍抛出 ApiError', async () => {
    const onPaymentRequired = vi.fn()
    const problem = {
      type: 'urn:yunyan:billing:insufficient_balance',
      title: 'Insufficient balance',
      status: 402,
      detail: 'Not enough points',
      availableBalance: 0,
      requiredPoints: 1,
    }

    const client = createApiClient({
      baseUrl: 'https://api.test/v1',
      fetch: async () => new Response(JSON.stringify(problem), { status: 402 }),
      onPaymentRequired,
    })

    await expect(client.post('/hold')).rejects.toBeInstanceOf(ApiError)
    expect(onPaymentRequired).toHaveBeenCalledOnce()
    expect(onPaymentRequired.mock.calls[0]?.[0]).toMatchObject({
      availableBalance: 0,
      requiredPoints: 1,
    })
  })
})
