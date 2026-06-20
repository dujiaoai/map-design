import { describe, expect, it } from 'vitest'

import {
  buildRbacAdminCrossLink,
  parseRbacAdminNavFrom,
  resolveRbacAdminBackLink,
} from './rbac-admin-nav'

describe('parseRbacAdminNavFrom', () => {
  it('accepts rbac cross-page from values', () => {
    expect(parseRbacAdminNavFrom('permissions')).toBe('permissions')
    expect(parseRbacAdminNavFrom('roles')).toBe('roles')
    expect(parseRbacAdminNavFrom('tenant-roles')).toBe('tenant-roles')
  })

  it('rejects unknown values', () => {
    expect(parseRbacAdminNavFrom('tenant-detail')).toBeNull()
    expect(parseRbacAdminNavFrom(null)).toBeNull()
  })
})

describe('buildRbacAdminCrossLink', () => {
  it('marks source page and preserves deep-link return context', () => {
    const href = buildRbacAdminCrossLink(
      'roles',
      'permissions',
      new URLSearchParams('module=admin'),
    )
    expect(href).toBe('/roles?from=permissions&returnModule=admin')
  })

  it('includes tenantId when linking to tenant roles', () => {
    const href = buildRbacAdminCrossLink(
      'tenant-roles',
      'permissions',
      new URLSearchParams(),
      { tenantId: 'tenant-1' },
    )
    expect(href).toBe('/tenant-roles?from=permissions&tenantId=tenant-1')
  })
})

describe('resolveRbacAdminBackLink', () => {
  it('returns contextual back link for rbac cross navigation', () => {
    const back = resolveRbacAdminBackLink(new URLSearchParams('from=permissions&returnModule=admin'))
    expect(back).toEqual({ to: '/permissions?module=admin', label: '返回权限目录' })
  })

  it('falls back to overview when from is missing', () => {
    expect(resolveRbacAdminBackLink(new URLSearchParams())).toEqual({
      to: '/',
      label: '返回概览',
    })
  })

  it('uses custom fallback when provided', () => {
    const back = resolveRbacAdminBackLink(new URLSearchParams(), {
      to: '/tenants/demo?tab=custom-roles',
      label: '返回租户',
    })
    expect(back).toEqual({ to: '/tenants/demo?tab=custom-roles', label: '返回租户' })
  })
})
