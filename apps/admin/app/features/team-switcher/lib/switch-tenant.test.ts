import { beforeEach, describe, expect, it, vi } from 'vitest'

import { auth } from '~/shared/auth/client'
import * as rememberLogin from '~/shared/lib/remember-login'

import { switchTenantBySlug } from './switch-tenant'

vi.mock('~/shared/auth/client', () => ({
  auth: {
    getSession: vi.fn(),
    login: vi.fn(),
    logout: vi.fn(),
  },
}))

vi.mock('~/shared/lib/remember-login', () => ({
  loadRememberLogin: vi.fn(),
  saveRememberLogin: vi.fn(),
}))

describe('switchTenantBySlug', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('returns switched when slug matches current tenant', async () => {
    vi.mocked(auth.getSession).mockReturnValue({
      user: { id: '1', email: 'a@t.local', roles: [], permissions: [] },
      tenant: { id: 't1', name: 'Demo', slug: 'demo' },
    })

    await expect(switchTenantBySlug('demo')).resolves.toBe('switched')
    expect(auth.login).not.toHaveBeenCalled()
  })

  it('re-logs in with remembered credentials', async () => {
    vi.mocked(auth.getSession).mockReturnValue({
      user: { id: '1', email: 'a@t.local', roles: [], permissions: [] },
      tenant: { id: 't1', name: 'Demo', slug: 'demo' },
    })
    vi.mocked(rememberLogin.loadRememberLogin).mockReturnValue({
      email: 'a@t.local',
      password: 'secret',
      tenantSlug: 'demo',
    })
    vi.mocked(auth.login).mockResolvedValue({
      user: { id: '1', email: 'a@t.local', roles: [], permissions: [] },
      tenant: { id: 't2', name: 'Other', slug: 'other' },
    })

    await expect(switchTenantBySlug('other')).resolves.toBe('switched')
    expect(auth.login).toHaveBeenCalledWith({
      email: 'a@t.local',
      password: 'secret',
      tenantId: 'other',
    })
    expect(rememberLogin.saveRememberLogin).toHaveBeenCalledWith('a@t.local', 'secret', 'other')
  })

  it('redirects to login when credentials are unavailable', async () => {
    vi.mocked(auth.getSession).mockReturnValue({
      user: { id: '1', email: 'a@t.local', roles: [], permissions: [] },
      tenant: { id: 't1', name: 'Demo', slug: 'demo' },
    })
    vi.mocked(rememberLogin.loadRememberLogin).mockReturnValue(null)
    vi.mocked(auth.logout).mockResolvedValue(undefined)

    await expect(switchTenantBySlug('other')).resolves.toBe('redirect-login')
    expect(auth.logout).toHaveBeenCalled()
  })
})
