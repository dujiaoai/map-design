import { SaaSRole } from '@repo/auth'
import { redirect } from 'react-router'
import { beforeEach, describe, expect, it, vi } from 'vitest'

import { auth } from '~/shared/auth/client'

import { requireAdminPermissions } from './require-admin-permissions'

vi.mock('react-router', () => ({
  redirect: vi.fn((path: string) => {
    throw new Error(`redirect:${path}`)
  }),
}))

vi.mock('~/shared/auth/client', () => ({
  auth: {
    hydrateSession: vi.fn(),
    getSession: vi.fn(),
  },
}))

describe('requireAdminPermissions', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('passes when user has required permission', () => {
    vi.mocked(auth.getSession).mockReturnValue({
      user: {
        id: '1',
        email: 'a@t.local',
        roles: [SaaSRole.PLATFORM_ADMIN],
        permissions: ['admin:tenants:read'],
      },
      tenant: { id: 't', name: 'Demo', slug: 'demo' },
    })

    expect(() => requireAdminPermissions(['admin:tenants:read'])).not.toThrow()
    expect(auth.hydrateSession).toHaveBeenCalled()
  })

  it('redirects to 403 when permission is missing', () => {
    vi.mocked(auth.getSession).mockReturnValue({
      user: {
        id: '1',
        email: 'a@t.local',
        roles: [SaaSRole.MEMBER],
        permissions: [],
      },
      tenant: { id: 't', name: 'Demo', slug: 'demo' },
    })

    expect(() => requireAdminPermissions(['admin:tenants:read'])).toThrow('redirect:/403')
    expect(redirect).toHaveBeenCalledWith('/403')
  })
})
