import type { Session } from '@repo/auth'
import type { NavUserData } from '@repo/ui'

const ADMIN_ROLE_LABELS: Record<string, string> = {
  PLATFORM_ADMIN: '平台管理员',
  TENANT_ADMIN: '租户管理员',
  MEMBER: '成员',
  VIEWER: '只读查看者',
}

export function formatAdminRoleLabel(role: string): string {
  return ADMIN_ROLE_LABELS[role] ?? role
}

export function formatAdminSessionRoles(roles: readonly string[]): string {
  if (roles.length === 0) return '-'
  return roles.map((role) => formatAdminRoleLabel(role)).join('、')
}

export function getSessionDisplayName(session: Session): string {
  return session.user.name?.trim() || session.user.email
}

export function getSessionInitials(session: Session): string {
  const name = getSessionDisplayName(session)
  return name.slice(0, 1).toUpperCase() || '?'
}

export function sessionToNavUserData(session: Session | null | undefined): NavUserData {
  if (!session) {
    return { name: '用户', email: '', avatar: '', initials: '?' }
  }

  const name = getSessionDisplayName(session)
  return {
    name,
    email: session.user.email,
    avatar: session.user.avatarUrl ?? '',
    initials: getSessionInitials(session),
  }
}
