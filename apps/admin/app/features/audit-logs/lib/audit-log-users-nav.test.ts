import { describe, expect, it } from 'vitest'

import { buildAuditUsersLink } from './audit-log-users-nav'

describe('buildAuditUsersLink', () => {
  it('builds users search URL with email query', () => {
    expect(buildAuditUsersLink('admin@demo.local')).toBe('/users?q=admin%40demo.local')
  })

  it('includes tenant filter when target tenant is present', () => {
    expect(buildAuditUsersLink('admin@demo.local', 'tenant-1')).toBe(
      '/users?q=admin%40demo.local&tenantId=tenant-1',
    )
  })
})
