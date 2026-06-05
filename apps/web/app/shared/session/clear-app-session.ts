import { useRuoYiProfileStore } from '~/entities/ruoyi-user'
import { auth } from '~/shared/auth/instance'
import { removeSessionQueries } from '~/shared/queries/invalidate-session-queries'

/** 清除 token、Query 缓存与 RuoYi profile（不触发 onUnauthorized，避免循环） */
export function clearAppSession() {
  useRuoYiProfileStore.getState().clear()
  removeSessionQueries()
  auth.store.getState().clear()
}
