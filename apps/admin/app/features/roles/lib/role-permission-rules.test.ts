import { describe, expect, it } from 'vitest'

import { filterPermissionsForRole } from './role-permission-rules'

describe('filterPermissionsForRole', () => {
  const permissions = [
    { id: '1', code: 'admin:tenants:read', name: 'a', description: '', scope: 'platform' as const },
    { id: '2', code: 'admin:members:read', name: 'b', description: '', scope: 'tenant' as const },
    { id: '3', code: 'workspace:use', name: 'c', description: '', scope: 'workspace' as const },
  ]

  it('keeps platform scope for PLATFORM_ADMIN', () => {
    expect(filterPermissionsForRole('PLATFORM_ADMIN', permissions).map((item) => item.code)).toEqual([
      'admin:tenants:read',
    ])
  })

  it('keeps tenant and workspace scopes for TENANT_ADMIN', () => {
    expect(filterPermissionsForRole('TENANT_ADMIN', permissions).map((item) => item.code)).toEqual([
      'admin:members:read',
      'workspace:use',
    ])
  })
})
