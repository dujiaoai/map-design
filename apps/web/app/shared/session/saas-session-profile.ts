import type { Session } from '@repo/auth'
import type { UserInfo } from '@repo/ruoyi-api'

function mapSaasRolesToRuoYiProfile(roles: Session['user']['roles']): {
  roles: string[]
  permissions: string[]
} {
  const isAdmin = roles.some((role) => role === 'PLATFORM_ADMIN' || role === 'TENANT_ADMIN')
  if (isAdmin) {
    return { roles: ['admin'], permissions: ['*:*:*'] }
  }
  return { roles: ['common'], permissions: [] }
}

/** 过渡期：将 SaaS Session 映射为 RuoYi profile，供尚未迁移的组件读取 */
export function sessionToRuoYiUserInfo(session: Session): UserInfo {
  const { user } = session
  const { roles, permissions } = mapSaasRolesToRuoYiProfile(user.roles)

  return {
    user: {
      userId: user.id,
      userName: user.email,
      nickName: user.name ?? user.email,
      email: user.email,
    },
    roles,
    permissions,
  }
}
