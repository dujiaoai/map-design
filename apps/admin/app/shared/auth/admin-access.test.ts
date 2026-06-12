import { describe, expect, it } from 'vitest'

import { SaaSRole } from '@repo/auth'

import {
  canAccessAdminMembers,
  canAccessAdminOverview,
  getAdminHomePath,
  hasAdminAccess,
  hasAnyPermissionCodes,
  resolveMembersTenantId,
} from './admin-access'

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

describe('canAccessAdminOverview', () => {
  it('allows platform tenant read permission', () => {
    expect(
      canAccessAdminOverview({
        user: {
          id: '1',
          email: 'a@t.local',
          roles: [],
          permissions: ['admin:tenants:read'],
        },
        tenant: { id: 't', name: 'Demo', slug: 'demo' },
      }),
    ).toBe(true)
  })

  it('denies members-only tenant admin', () => {
    expect(
      canAccessAdminOverview({
        user: {
          id: '1',
          email: 'a@t.local',
          roles: [SaaSRole.TENANT_ADMIN],
          permissions: ['admin:members:read', 'admin:members:write'],
        },
        tenant: { id: 't', name: 'Demo', slug: 'demo' },
      }),
    ).toBe(false)
  })
})

describe('getAdminHomePath', () => {
  it('returns members for tenant-only admin', () => {
    expect(
      getAdminHomePath({
        user: {
          id: '1',
          email: 'a@t.local',
          roles: [SaaSRole.TENANT_ADMIN],
          permissions: ['admin:members:read'],
        },
        tenant: { id: 't', name: 'Demo', slug: 'demo' },
      }),
    ).toBe('/members')
  })
})

describe('canAccessAdminMembers', () => {
  it('allows platform admin without members permission', () => {
    expect(
      canAccessAdminMembers({
        user: { id: '1', email: 'a@t.local', roles: [SaaSRole.PLATFORM_ADMIN], permissions: [] },
        tenant: { id: 't1', name: 'Demo', slug: 'demo' },
      }),
    ).toBe(true)
  })
})

describe('resolveMembersTenantId', () => {
  const platformSession = {
    user: { id: '1', email: 'a@t.local', roles: [SaaSRole.PLATFORM_ADMIN], permissions: [] },
    tenant: { id: 't1', name: 'Demo', slug: 'demo' },
  }

  const tenantAdminSession = {
    user: {
      id: '2',
      email: 'b@t.local',
      roles: [SaaSRole.TENANT_ADMIN],
      permissions: ['admin:members:read'],
    },
    tenant: { id: 't1', name: 'Demo', slug: 'demo' },
  }

  it('lets platform admin use query tenantId', () => {
    expect(resolveMembersTenantId(platformSession, 't2')).toBe('t2')
  })

  it('blocks tenant admin from other tenant', () => {
    expect(resolveMembersTenantId(tenantAdminSession, 't2')).toBeNull()
  })

  it('defaults to session tenant', () => {
    expect(resolveMembersTenantId(tenantAdminSession, null)).toBe('t1')
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
