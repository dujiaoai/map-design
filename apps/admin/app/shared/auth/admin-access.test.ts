import { describe, expect, it } from 'vitest'

import { SaaSRole } from '@repo/auth'

import { hasAdminAccess, hasAnyPermissionCodes } from './admin-access'

describe('hasAdminAccess', () => {
  it('allows platform admin role', () => {
    expect(
      hasAdminAccess({
        user: { id: '1', email: 'a@t.local', roles: [SaaSRole.PLATFORM_ADMIN] },
        tenant: { id: 't', name: 'Demo', slug: 'demo' },
      }),
    ).toBe(true)
  })

  it('allows tenant admin with members permission only', () => {
    expect(
      hasAdminAccess({
        user: {
          id: '1',
          email: 'a@t.local',
          roles: [SaaSRole.MEMBER],
          permissions: ['admin:members:read'],
        },
        tenant: { id: 't', name: 'Demo', slug: 'demo' },
      }),
    ).toBe(true)
  })

  it('denies member without admin permissions', () => {
    expect(
      hasAdminAccess({
        user: { id: '1', email: 'a@t.local', roles: [SaaSRole.MEMBER], permissions: [] },
        tenant: { id: 't', name: 'Demo', slug: 'demo' },
      }),
    ).toBe(false)
  })
})

describe('hasAnyPermissionCodes', () => {
  it('returns true when no codes required', () => {
    expect(hasAnyPermissionCodes([], [])).toBe(true)
  })

  it('matches any required code', () => {
    expect(hasAnyPermissionCodes(['admin:users:read'], ['admin:tenants:read', 'admin:users:read'])).toBe(
      true,
    )
  })
})
