import { describe, expect, it } from 'vitest'

import { PermissionCodes } from '../permission-codes'
import { SaaSRole, type Session } from '../types'
import { hasAnyPermission, hasPermission, requirePermission } from './permissions'

const memberSession: Session = {
  user: {
    id: '1',
    email: 'm@demo.local',
    roles: [SaaSRole.MEMBER],
    permissions: [PermissionCodes.WORKSPACE_USE, PermissionCodes.WORKSPACE_MAP_WRITE],
  },
  tenant: { id: 't1', name: 'Demo' },
}

describe('permissions', () => {
  it('hasPermission exact match', () => {
    expect(hasPermission(memberSession.user.permissions, PermissionCodes.WORKSPACE_USE)).toBe(true)
    expect(hasPermission(memberSession.user.permissions, PermissionCodes.ADMIN_USERS_READ)).toBe(false)
  })

  it('hasAnyPermission', () => {
    expect(
      hasAnyPermission(memberSession.user.permissions, [
        PermissionCodes.WORKSPACE_MAP_READ,
        PermissionCodes.WORKSPACE_MAP_WRITE,
      ]),
    ).toBe(true)
  })

  it('requirePermission redirects when missing', () => {
    const redirect = (path: string) =>
      new Response(null, { status: 302, headers: { Location: path } })
    expect(() =>
      requirePermission(memberSession, PermissionCodes.ADMIN_TENANTS_READ, redirect),
    ).toThrow()
  })
})
