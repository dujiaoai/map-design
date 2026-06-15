import { describe, expect, it } from 'vitest'

import { resolveAdminPageTitle } from './resolve-admin-page-title'

describe('resolveAdminPageTitle', () => {
  it('returns nav label for known routes', () => {
    expect(resolveAdminPageTitle('/')).toBe('概览')
    expect(resolveAdminPageTitle('/billing')).toBe('计费')
    expect(resolveAdminPageTitle('/system')).toBe('系统')
  })

  it('returns tenant detail title for tenant uuid path', () => {
    expect(resolveAdminPageTitle('/tenants/11111111-1111-1111-1111-111111111101')).toBe(
      '租户详情',
    )
  })

  it('falls back for unknown paths', () => {
    expect(resolveAdminPageTitle('/unknown-path')).toBe('运营控制台')
  })
})
