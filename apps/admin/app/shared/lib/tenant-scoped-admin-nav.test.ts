import { describe, expect, it } from 'vitest'

import { resolveTenantScopedAdminBackLink } from './tenant-scoped-admin-nav'

describe('resolveTenantScopedAdminBackLink', () => {
  it('returns null when opened from sidebar without tenantId', () => {
    expect(
      resolveTenantScopedAdminBackLink(new URLSearchParams(), {
        tenantTab: 'members',
        canReadTenants: true,
      }),
    ).toBeNull()
  })

  it('returns tenant detail when tenantId is in query', () => {
    expect(
      resolveTenantScopedAdminBackLink(new URLSearchParams('tenantId=demo'), {
        tenantTab: 'members',
        canReadTenants: true,
      }),
    ).toEqual({ to: '/tenants/demo?tab=members', label: '返回租户' })
  })

  it('returns null when user cannot read tenants', () => {
    expect(
      resolveTenantScopedAdminBackLink(new URLSearchParams('tenantId=demo'), {
        tenantTab: 'members',
        canReadTenants: false,
      }),
    ).toBeNull()
  })

  it('prefers rbac cross-navigation back link', () => {
    expect(
      resolveTenantScopedAdminBackLink(
        new URLSearchParams('from=permissions&tenantId=demo'),
        {
          tenantTab: 'custom-roles',
          canReadTenants: true,
        },
      ),
    ).toEqual({ to: '/permissions', label: '返回权限目录' })
  })
})
