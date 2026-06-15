import { describe, expect, it } from 'vitest'

import { appendAdminListTotal } from './format-admin-list-description'

describe('appendAdminListTotal', () => {
  it('returns base description when not loaded', () => {
    expect(appendAdminListTotal('租户列表。', { total: 10, loaded: false })).toBe('租户列表。')
  })

  it('appends total with unit when loaded', () => {
    expect(
      appendAdminListTotal('跨租户用户列表。', { total: 42, loaded: true, unit: '个' }),
    ).toBe('跨租户用户列表。共 42 个。')
  })

  it('adds period before total when description omits trailing punctuation', () => {
    expect(appendAdminListTotal('审计日志', { total: 3, loaded: true, unit: '条' })).toBe(
      '审计日志。共 3 条。',
    )
  })
})
