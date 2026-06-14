import { PermissionCodes, SaaSRole, type Session } from '@repo/auth'
import { describe, expect, it } from 'vitest'

import { buildAdminNavSections } from './build-admin-nav-sections'

function session(partial: Partial<Session['user']> & { tenant?: Session['tenant'] }): Session {
  return {
    user: {
      id: '1',
      email: 'u@demo.local',
      roles: [],
      permissions: [],
      ...partial,
    },
    tenant: partial.tenant ?? { id: 't1', name: 'Demo', slug: 'demo' },
  }
}

describe('buildAdminNavSections', () => {
  it('shows members nav for platform admin without admin:members:read in JWT', () => {
    const sections = buildAdminNavSections(
      '/',
      session({
        roles: [SaaSRole.PLATFORM_ADMIN],
        permissions: [
          PermissionCodes.ADMIN_TENANTS_READ,
          PermissionCodes.ADMIN_USERS_READ,
          PermissionCodes.ADMIN_ROLES_READ,
        ],
      }),
    )

    const collaboration = sections.find((section) => section.id === 'collaboration')
    expect(collaboration?.items.map((item) => item.id)).toContain('/members')
  })

  it('hides members nav for user without members permission or platform role', () => {
    const sections = buildAdminNavSections(
      '/',
      session({
        roles: [SaaSRole.MEMBER],
        permissions: [PermissionCodes.ADMIN_ROLES_READ],
      }),
    )

    const collaboration = sections.find((section) => section.id === 'collaboration')
    expect(collaboration?.items.map((item) => item.id) ?? []).not.toContain('/members')
  })

  it('shows members nav when admin:members:read is present', () => {
    const sections = buildAdminNavSections(
      '/members',
      session({
        roles: [SaaSRole.TENANT_ADMIN],
        permissions: [PermissionCodes.ADMIN_MEMBERS_READ],
      }),
    )

    const collaboration = sections.find((section) => section.id === 'collaboration')
    expect(collaboration?.items.map((item) => item.id)).toContain('/members')
  })
})
