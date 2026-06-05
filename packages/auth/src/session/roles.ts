import type { RedirectFn, SaaSRole, Session } from '../types'

export function hasRole(userRoles: SaaSRole[], role: SaaSRole): boolean {
  return userRoles.includes(role)
}

export function hasAnyRole(userRoles: SaaSRole[], allowed: SaaSRole[]): boolean {
  return allowed.some((role) => userRoles.includes(role))
}

export function requireRole(
  session: Session | null,
  allowed: SaaSRole | SaaSRole[],
  redirect: RedirectFn,
): Session {
  if (!session) throw redirect('/login')
  const roles = Array.isArray(allowed) ? allowed : [allowed]
  if (!hasAnyRole(session.user.roles, roles)) throw redirect('/403')
  return session
}

export function requireAuthenticated(isAuthenticated: boolean, redirect: RedirectFn): void {
  if (!isAuthenticated) throw redirect('/login')
}
