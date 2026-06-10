import { SaaSRole, PermissionCodes } from '@repo/auth'
import { describe, expect, it } from 'vitest'

import {
  sessionCanWriteMap,
  sessionHasPermission,
  sessionIsTenantOrPlatformAdmin,
  sessionPermissionCodes,
} from './session-access'

describe('sessionPermissionCodes', () => {
  it('returns SaaS permissions from session user', () => {
    expect(
      sessionPermissionCodes({
        user: {
          id: 'u1',
          email: 'admin@demo.local',
          roles: [SaaSRole.TENANT_ADMIN],
          permissions: [PermissionCodes.WORKSPACE_USE, PermissionCodes.ADMIN_MEMBERS_READ],
        },
        tenant: { id: 't1', name: 'Demo', slug: 'demo' },
      }),
    ).toEqual([PermissionCodes.WORKSPACE_USE, PermissionCodes.ADMIN_MEMBERS_READ])
  })

  it('returns empty when permissions missing', () => {
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

describe('sessionHasPermission', () => {
  it('checks exact permission code', () => {
    expect(
      sessionHasPermission(
        {
          user: {
            id: 'u1',
            email: 'm@demo.local',
            roles: [SaaSRole.MEMBER],
            permissions: [PermissionCodes.WORKSPACE_MAP_WRITE],
          },
          tenant: null,
        },
        PermissionCodes.WORKSPACE_MAP_WRITE,
      ),
    ).toBe(true)
  })
})

describe('sessionCanWriteMap', () => {
  it('requires workspace:map:write', () => {
    expect(
      sessionCanWriteMap({
        user: {
          id: 'u1',
          email: 'v@demo.local',
          roles: [SaaSRole.VIEWER],
          permissions: [PermissionCodes.WORKSPACE_USE, PermissionCodes.WORKSPACE_MAP_READ],
        },
        tenant: null,
      }),
    ).toBe(false)
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
