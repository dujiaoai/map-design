import { describe, expect, it } from 'vitest'

import { formatTenantPlan } from './format-tenant-plan'

describe('formatTenantPlan', () => {
  it('maps known plans to Chinese labels', () => {
    expect(formatTenantPlan('free')).toBe('免费版')
    expect(formatTenantPlan('PRO')).toBe('专业版')
  })

  it('falls back to raw plan string', () => {
    expect(formatTenantPlan('custom-tier')).toBe('custom-tier')
  })
})
