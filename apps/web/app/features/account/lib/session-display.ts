import type { Session } from '@repo/auth'
import type { NavUserData } from '@repo/ui'

import { resolveAvatarSrc } from '~/entities/ruoyi-user'

const ROLE_LABELS: Record<string, string> = {
  PLATFORM_ADMIN: '平台管理员',
  TENANT_ADMIN: '租户管理员',
  MEMBER: '成员',
  VIEWER: '查看者',
}

export function formatSessionRoles(roles: readonly string[]): string {
  if (roles.length === 0) return '-'
  return roles.map((role) => ROLE_LABELS[role] ?? role).join('、')
}

export function sessionToNavUserData(
  session: Session | null | undefined,
  options?: { loading?: boolean },
): NavUserData {
  if (options?.loading && !session) {
    return { name: '加载中…', email: '', avatar: resolveAvatarSrc(null), initials: '…' }
  }

  if (!session) {
    return { name: '用户', email: '', avatar: resolveAvatarSrc(null), initials: '?' }
  }

  const name = session.user.name?.trim() || session.user.email

  return {
    name,
    email: session.user.email,
    avatar: resolveAvatarSrc(null),
    initials: name.slice(0, 1).toUpperCase() || '?',
  }
}
