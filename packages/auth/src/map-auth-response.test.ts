import { describe, expect, it } from 'vitest'
import { authTokensToTokenPair, loginResponseToSession } from './map-auth-response'
import { SaaSRole } from './types'

describe('map-auth-response', () => {
  it('loginResponseToSession maps flat login payload to Session', () => {
    const session = loginResponseToSession({
      accessToken: 'access',
      refreshToken: 'refresh',
      expiresIn: 900,
      user: {
        id: 'user-1',
        email: 'admin@test.local',
        name: 'Admin',
        roles: [SaaSRole.TENANT_ADMIN],
        tenant: { id: 'tenant-1', name: 'Test', slug: 'test' },
      },
    })

    expect(session.user.email).toBe('admin@test.local')
    expect(session.tenant?.slug).toBe('test')
    expect(session.expiresAt).toBeGreaterThan(Date.now())
  })

  it('authTokensToTokenPair maps refresh payload to TokenPair', () => {
    const tokens = authTokensToTokenPair({
      accessToken: 'new-access',
      refreshToken: 'new-refresh',
      expiresIn: 900,
    })

    expect(tokens.accessToken).toBe('new-access')
    expect(tokens.expiresIn).toBe(900)
    expect(tokens.expiresAt).toBeGreaterThan(Date.now())
  })
})
