import { SaaSRole } from '@repo/auth'
import { describe, expect, it } from 'vitest'

import { sessionToRuoYiUserInfo } from './saas-session-profile'

describe('sessionToRuoYiUserInfo', () => {
  it('maps platform admin to RuoYi admin profile', () => {
    const info = sessionToRuoYiUserInfo({
      user: {
        id: 'u1',
        email: 'admin@demo.local',
        name: 'Admin',
        roles: [SaaSRole.PLATFORM_ADMIN],
      },
      tenant: { id: 't1', name: 'Demo', slug: 'demo' },
    })

    expect(info.user.userId).toBe('u1')
    expect(info.user.email).toBe('admin@demo.local')
    expect(info.roles).toEqual(['admin'])
    expect(info.permissions).toEqual(['*:*:*'])
  })

  it('maps member to common role without wildcard permissions', () => {
    const info = sessionToRuoYiUserInfo({
      user: {
        id: 'u2',
        email: 'user@demo.local',
        roles: [SaaSRole.MEMBER],
      },
      tenant: null,
    })

    expect(info.roles).toEqual(['common'])
    expect(info.permissions).toEqual([])
  })
})
