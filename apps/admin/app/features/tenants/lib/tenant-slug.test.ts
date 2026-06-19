import { describe, expect, it } from 'vitest'

import { suggestTenantSlug, tenantInitials } from './tenant-slug'

describe('tenant-slug', () => {
  it('suggestTenantSlug normalizes display name', () => {
    expect(suggestTenantSlug('Active Corp')).toBe('active-corp')
    expect(suggestTenantSlug('  Trial_Startup!! ')).toBe('trial-startup')
  })

  it('tenantInitials uses first letters', () => {
    expect(tenantInitials('Active Corp')).toBe('AC')
    expect(tenantInitials('Solo')).toBe('SO')
  })
})
