import type { UserInfo } from '@repo/ruoyi-api'

import { useRuoYiProfileStore } from '~/entities/ruoyi-user'
import { auth } from '~/shared/auth/instance'
import { createMockUserInfo, isMockAccessToken } from '~/shared/mock/dev-auth'

import { fetchAndPersistSaasSession } from './fetch-saas-session'
import { sessionToRuoYiUserInfo } from './saas-session-profile'

/** 资料变更后刷新会话（SaaS `users/me` 或 mock profile） */
export async function refreshAuthenticatedUser(): Promise<UserInfo> {
  if (isMockAccessToken(auth.getAccessToken())) {
    const session = auth.getSession()
    const userInfo = createMockUserInfo(session?.user.name ?? 'dev')
    useRuoYiProfileStore.getState().setProfile(userInfo)
    return userInfo
  }

  const session = await fetchAndPersistSaasSession()
  return sessionToRuoYiUserInfo(session)
}
