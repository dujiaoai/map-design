import { describe, expect, it } from 'vitest'

import { formatAdminShellTitle } from './format-admin-shell-title'

describe('formatAdminShellTitle', () => {
  it('returns base title when detail is missing', () => {
    expect(formatAdminShellTitle('租户详情')).toBe('租户详情')
    expect(formatAdminShellTitle('租户详情', null)).toBe('租户详情')
    expect(formatAdminShellTitle('租户详情', '   ')).toBe('租户详情')
  })

  it('appends detail with middle dot separator', () => {
    expect(formatAdminShellTitle('租户详情', 'Demo Org')).toBe('租户详情 · Demo Org')
  })
})
