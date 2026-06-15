import { describe, expect, it } from 'vitest'

import { parseTenantDetailTab, resolveTenantDetailTab } from './tenant-detail-nav'

describe('parseTenantDetailTab', () => {
  it('returns valid tab from query', () => {
    expect(parseTenantDetailTab('members')).toBe('members')
    expect(parseTenantDetailTab('features')).toBe('features')
  })

  it('falls back when tab is missing or invalid', () => {
    expect(parseTenantDetailTab(null)).toBe('info')
    expect(parseTenantDetailTab('unknown', 'features')).toBe('features')
  })
})

describe('resolveTenantDetailTab', () => {
  it('redirects members tab when member access is denied', () => {
    expect(resolveTenantDetailTab('members', { canReadMembers: false })).toBe('info')
    expect(resolveTenantDetailTab('custom-roles', { canReadMembers: false })).toBe('info')
  })

  it('keeps members tab when member access is allowed', () => {
    expect(resolveTenantDetailTab('members', { canReadMembers: true })).toBe('members')
  })
})
