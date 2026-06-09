import { SaaSRole } from '@repo/auth'
import { describe, expect, it } from 'vitest'

import { formatSessionRoles } from './session-display'

describe('formatSessionRoles', () => {
  it('maps known roles to Chinese labels', () => {
    expect(formatSessionRoles([SaaSRole.TENANT_ADMIN, SaaSRole.MEMBER])).toBe(
      '租户管理员、成员',
    )
  })
})
