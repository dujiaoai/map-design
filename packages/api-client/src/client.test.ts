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
})
