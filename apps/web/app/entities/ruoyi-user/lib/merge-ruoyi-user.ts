import type { RuoYiUser } from '@haoxuan/ruoyi-api'

import { isBlankAvatarValue } from './resolve-avatar-src'

function pickAvatarField(
  primary: string | null | undefined,
  fallback: string | null | undefined,
): string | null | undefined {
  if (!isBlankAvatarValue(primary)) return primary
  if (!isBlankAvatarValue(fallback)) return fallback
  return primary ?? fallback
}

/** 合并 profile 与 getInfo 用户对象，优先保留有效头像字段 */
export function mergeRuoYiUser(
  primary: RuoYiUser | null | undefined,
  fallback: RuoYiUser | null | undefined,
): RuoYiUser | null {
  if (!primary && !fallback) return null
  if (!primary) return fallback ?? null
  if (!fallback) return primary

  return {
    ...primary,
    icon: pickAvatarField(primary.icon, fallback.icon),
    avatar: pickAvatarField(primary.avatar, fallback.avatar),
  }
}
