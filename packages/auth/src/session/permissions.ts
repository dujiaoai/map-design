import type { RedirectFn, Session } from '../types'

export function hasPermission(
  granted: readonly string[] | undefined,
  required: string,
): boolean {
  if (!granted?.length) return false
  return granted.includes(required)
}

export function hasAnyPermission(
  granted: readonly string[] | undefined,
  required: readonly string[],
): boolean {
  if (!required.length) return true
  if (!granted?.length) return false
  return required.some((code) => granted.includes(code))
}

export function requirePermission(
  session: Session | null,
  required: string | readonly string[],
  redirect: RedirectFn,
): Session {
  if (!session) throw redirect('/login')
  const codes = typeof required === 'string' ? [required] : required
  if (!hasAnyPermission(session.user.permissions, codes)) throw redirect('/403')
  return session
}
