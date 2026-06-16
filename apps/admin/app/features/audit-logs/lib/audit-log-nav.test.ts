import { describe, expect, it } from 'vitest'

import { buildAuditLogsLink } from './audit-log-nav'

describe('buildAuditLogsLink', () => {
  it('builds audit logs URL with optional filters', () => {
    expect(buildAuditLogsLink()).toBe('/audit-logs')
    expect(buildAuditLogsLink({ tenantId: 'tenant-1' })).toBe('/audit-logs?tenantId=tenant-1')
    expect(buildAuditLogsLink({ actorUserId: 'user-1', tenantId: 'tenant-1' })).toBe(
      '/audit-logs?tenantId=tenant-1&actorUserId=user-1',
    )
  })
})
