import type { UserInfo } from '@repo/ruoyi-api'
import { RuoYiApiError } from '@repo/ruoyi-api'

import { useRuoYiProfileStore } from '~/entities/ruoyi-user'
import { auth } from '~/shared/auth/instance'
import { createMockUserInfo, isMockAccessToken } from '~/shared/mock/dev-auth'
import { queryClient } from '~/shared/lib/query-client'
import { menuRoutersQueryOptions, userInfoQueryOptions } from '~/shared/queries'

import { clearAppSession } from './clear-app-session'

function syncAuthSessionFromUserInfo(info: UserInfo) {
  const session = auth.getSession()
  const token = auth.getAccessToken()
  if (!session || !token) return

  auth.setSession(
    {
      ...session,
      user: {
        ...session.user,
        id: String(info.user.userId),
        name: info.user.nickName ?? info.user.userName,
        email: info.user.email?.includes('@') ? info.user.email : session.user.email,
      },
    },
    { accessToken: token },
  )
}

/** 受保护应用壳层启动：拉取 RuoYi 用户/菜单并写入 profile store */
export async function bootstrapAuthenticatedApp() {
  if (isMockAccessToken(auth.getAccessToken())) {
    const session = auth.getSession()
    const userInfo = createMockUserInfo(session?.user.name ?? 'dev')
    useRuoYiProfileStore.getState().setProfile(userInfo)
    syncAuthSessionFromUserInfo(userInfo)
    return userInfo
  }

  try {
    const [userInfo] = await Promise.all([
      queryClient.ensureQueryData(userInfoQueryOptions()),
      queryClient.ensureQueryData(menuRoutersQueryOptions()),
    ])

    useRuoYiProfileStore.getState().setProfile(userInfo)
    syncAuthSessionFromUserInfo(userInfo)

    return userInfo
  } catch (error) {
    if (error instanceof RuoYiApiError && (error.code === 401 || error.code === 403)) {
      clearAppSession()
    }
    throw error
  }
}

export { clearAppSession } from './clear-app-session'
