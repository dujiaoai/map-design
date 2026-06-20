import { SaaSRole, type Session } from '@repo/auth'

const PLATFORM_PERMISSION_PREFIXES = [
  'admin:tenants:',
  'admin:users:',
  'admin:roles:',
] as const

const OVERVIEW_PERMISSIONS = [
  'admin:tenants:read',
  'admin:users:read',
  'admin:roles:read',
] as const

/** 是否可进入运营后台（平台或租户管理员能力） */
export function hasAdminAccess(session: Session | null): boolean {
  if (!session) return false

  const roles = session.user.roles
  if (roles.includes(SaaSRole.PLATFORM_ADMIN) || roles.includes(SaaSRole.TENANT_ADMIN)) {
    return true
  }

  const permissions = session.user.permissions ?? []
  if (permissions.some((code) => code.startsWith('admin:members:'))) return true
  return permissions.some((code) =>
    PLATFORM_PERMISSION_PREFIXES.some((prefix) => code.startsWith(prefix)),
  )
}

export function hasPermission(session: Session | null, code: string): boolean {
  if (!session) return false
  return (session.user.permissions ?? []).includes(code)
}

export function hasAnyPermission(session: Session | null, codes: string[]): boolean {
  if (!session) return false
  return hasAnyPermissionCodes(session.user.permissions ?? [], codes)
}

export function hasAnyPermissionCodes(userPermissions: string[], codes: string[]): boolean {
  if (codes.length === 0) return true
  return codes.some((code) => userPermissions.includes(code))
}

/** 是否可访问运营概览（平台级读权限） */
export function canAccessAdminOverview(session: Session | null): boolean {
  return hasAnyPermission(session, [...OVERVIEW_PERMISSIONS])
}

/** 租户管理员默认落点 */
export function getAdminHomePath(session: Session | null): string {
  return canAccessAdminOverview(session) ? '/' : '/members'
}

export function isPlatformAdmin(session: Session | null): boolean {
  return session?.user.roles.includes(SaaSRole.PLATFORM_ADMIN) ?? false
}

/** 成员管理：平台运营或具备 admin:members:read */
export function canAccessAdminMembers(session: Session | null): boolean {
  if (!session) return false
  if (isPlatformAdmin(session)) return true
  return hasAnyPermission(session, ['admin:members:read'])
}

/** 成员/租户角色写操作：平台运营或具备 members/tenants 写权限 */
export function canWriteAdminMembers(session: Session | null): boolean {
  if (!session) return false
  if (isPlatformAdmin(session)) return true
  return hasAnyPermission(session, ['admin:members:write', 'admin:tenants:write'])
}

/** 解析成员页目标租户：平台可读 ?tenantId=，租户管理员仅本租户 */
export function resolveMembersTenantId(
  session: Session | null,
  tenantIdFromQuery: string | null,
): string | null {
  if (!session) return null

  if (tenantIdFromQuery) {
    if (isPlatformAdmin(session)) return tenantIdFromQuery
    if (session.tenant?.id === tenantIdFromQuery) return tenantIdFromQuery
    return null
  }

  return session.tenant?.id ?? null
}
