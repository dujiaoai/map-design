import {
  hasAnyPermission,
  hasPermission,
  PermissionCodes,
  SaaSRole,
  type Session,
} from '@repo/auth'

export { PermissionCodes }

/** 会话有效权限码（来自 SaaS `users/me` / login，精确匹配） */
export function sessionPermissionCodes(session: Session | null | undefined): string[] {
  return session?.user.permissions ?? []
}

export function sessionHasPermission(
  session: Session | null | undefined,
  code: string,
): boolean {
  return hasPermission(sessionPermissionCodes(session), code)
}

export function sessionHasAnyPermission(
  session: Session | null | undefined,
  codes: readonly string[],
): boolean {
  return hasAnyPermission(sessionPermissionCodes(session), codes)
}

export function sessionHasSaasRole(
  session: Session | null | undefined,
  role: SaaSRole,
): boolean {
  return session?.user.roles.includes(role) ?? false
}

export function sessionIsTenantOrPlatformAdmin(session: Session | null | undefined): boolean {
  return (
    sessionHasSaasRole(session, SaaSRole.PLATFORM_ADMIN) ||
    sessionHasSaasRole(session, SaaSRole.TENANT_ADMIN)
  )
}

export function sessionCanAccessWorkspace(session: Session | null | undefined): boolean {
  return sessionHasPermission(session, PermissionCodes.WORKSPACE_USE)
}

export function sessionCanWriteMap(session: Session | null | undefined): boolean {
  return sessionHasPermission(session, PermissionCodes.WORKSPACE_MAP_WRITE)
}

export function sessionCanReadMap(session: Session | null | undefined): boolean {
  return sessionHasAnyPermission(session, [
    PermissionCodes.WORKSPACE_MAP_READ,
    PermissionCodes.WORKSPACE_MAP_WRITE,
  ])
}
