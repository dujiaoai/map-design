import { SaaSRole } from '@repo/auth'
import { describe, expect, it } from 'vitest'

import {
  sessionIsTenantOrPlatformAdmin,
  sessionPermissionCodes,
} from './session-access'

describe('sessionPermissionCodes', () => {
  it('grants wildcard to tenant/platform admin', () => {
    expect(
      sessionPermissionCodes({
        user: {
          id: 'u1',
          email: 'admin@demo.local',
          roles: [SaaSRole.TENANT_ADMIN],
        },
        tenant: { id: 't1', name: 'Demo', slug: 'demo' },
      }),
    ).toEqual(['*:*:*'])
  })

  it('returns empty for member', () => {
    expect(
      sessionPermissionCodes({
        user: {
          id: 'u2',
          email: 'user@demo.local',
          roles: [SaaSRole.MEMBER],
        },
        tenant: null,
      }),
    ).toEqual([])
  })
})

describe('sessionIsTenantOrPlatformAdmin', () => {
  it('detects platform admin', () => {
    expect(
      sessionIsTenantOrPlatformAdmin({
        user: {
          id: 'u1',
          email: 'a@b.c',
          roles: [SaaSRole.PLATFORM_ADMIN],
        },
        tenant: null,
      }),
    ).toBe(true)
  })
})
