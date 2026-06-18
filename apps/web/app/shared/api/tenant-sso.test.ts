import { describe, expect, it } from 'vitest'

import { isTenantSsoLoginVisible } from '~/shared/hooks/use-tenant-sso'

describe('tenant SSO login entry', () => {
  it('shows button when enabled and configured', () => {
    expect(
      isTenantSsoLoginVisible({
        tenantSlug: 'demo',
        enabled: true,
        displayName: 'Corp SSO',
        loginAvailable: true,
      }),
    ).toBe(true)
  })

  it('hides button when disabled', () => {
    expect(
      isTenantSsoLoginVisible({
        tenantSlug: 'demo',
        enabled: false,
        displayName: null,
        loginAvailable: false,
      }),
    ).toBe(false)
  })
})
