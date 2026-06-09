import type { Session } from '@repo/auth'

import { auth } from '~/shared/auth/instance'

/** 将 Session 写回 `@repo/auth` 存储（保留当前 token 对） */
export function persistAuthSession(session: Session) {
  const token = auth.getAccessToken()
  if (!token) return

  auth.setSession(session, {
    accessToken: token,
    refreshToken: auth.getRefreshToken() ?? undefined,
    expiresAt: session.expiresAt,
  })
}
