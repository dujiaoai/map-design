export type TenantRoleNavFrom = 'tenant-detail' | 'list'

export function buildTenantRolesListHref(
  tenantId: string,
  options?: { roleId?: string },
) {
  const params = new URLSearchParams({ tenantId })
  if (options?.roleId) params.set('roleId', options.roleId)
  return `/tenant-roles?${params}`
}

export function buildCreateTenantRoleHref(
  tenantId: string,
  options?: { from?: TenantRoleNavFrom },
) {
  const params = new URLSearchParams({ tenantId })
  if (options?.from) params.set('from', options.from)
  return `/tenant-roles/new?${params}`
}

export function buildCreateTenantRoleCancelHref(
  tenantId: string,
  from: string | null | undefined,
) {
  if (from === 'tenant-detail') {
    return `/tenants/${tenantId}?tab=custom-roles`
  }
  return buildTenantRolesListHref(tenantId)
}

export function buildAfterCreateTenantRoleHref(
  tenantId: string,
  from: string | null | undefined,
  roleId: string,
) {
  if (from === 'tenant-detail') {
    const params = new URLSearchParams({ tab: 'custom-roles', roleId })
    return `/tenants/${tenantId}?${params}`
  }
  return buildTenantRolesListHref(tenantId, { roleId })
}

export function parseTenantRoleNavFrom(value: string | null): TenantRoleNavFrom | null {
  if (value === 'tenant-detail') return 'tenant-detail'
  return null
}
