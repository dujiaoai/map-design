import type { NavUserData } from '@haoxuan/ui'
import type { RuoYiUser } from '@haoxuan/ruoyi-api'

import { resolveAvatarSrc } from './resolve-avatar-src'

/** 将 RuoYi 用户转为侧栏/账号 NavUser 展示结构 */
export function toNavUserData(
  user: RuoYiUser | null | undefined,
  options?: { loading?: boolean },
): NavUserData {
  if (options?.loading && !user) {
    return { name: '加载中…', email: '', avatar: resolveAvatarSrc(null), initials: '…' }
  }

  if (!user) {
    return { name: '用户', email: '', avatar: resolveAvatarSrc(null), initials: '?' }
  }

  const name = user.nickName?.trim() || user.userName
  const email = user.email?.trim() || user.phonenumber?.trim() || user.userName

  return {
    name,
    email,
    avatar: resolveAvatarSrc(user.icon ?? user.avatar),
    initials: name.slice(0, 1).toUpperCase(),
  }
}
