import { SaaSRole, type Session } from '@repo/auth'

/** 过渡期权限码：Sprint D 后改为 `users/me` 返回的细粒度权限 */
export function sessionPermissionCodes(session: Session | null | undefined): string[] {
  if (!session) return []

  const isAdmin = session.user.roles.some(
    (role) => role === SaaSRole.PLATFORM_ADMIN || role === SaaSRole.TENANT_ADMIN,
  )
  return isAdmin ? ['*:*:*'] : []
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
