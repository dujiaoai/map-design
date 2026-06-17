import { describe, expect, it } from 'vitest'

import { loginResponseSchema } from './types'

describe('loginResponseSchema', () => {
  it('accepts null MFA fields from Java API', () => {
    const parsed = loginResponseSchema.parse({
      accessToken: 'access',
      refreshToken: 'refresh',
      expiresIn: 900,
      user: {
        id: '22222222-2222-2222-2222-222222222201',
        email: 'admin@demo.local',
        name: 'Demo Admin',
        phone: null,
        avatarUrl: null,
        roles: ['PLATFORM_ADMIN', 'TENANT_ADMIN'],
        permissions: ['admin:tenants:read'],
        tenant: { id: '11111111-1111-1111-1111-111111111101', name: 'Demo', slug: 'demo' },
      },
      homeTenant: null,
      mfaRequired: null,
      mfaChallengeToken: null,
    })
    expect(parsed.mfaRequired).toBeNull()
    expect(parsed.accessToken).toBe('access')
  })
})
