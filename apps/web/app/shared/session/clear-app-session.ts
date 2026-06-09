import { auth } from '~/shared/auth/instance'
import { removeSessionQueries } from '~/shared/queries/invalidate-session-queries'

/** 清除 token 与会话 Query 缓存（不触发 onUnauthorized，避免循环） */
export function clearAppSession() {
  removeSessionQueries()
  auth.store.getState().clear()
}
