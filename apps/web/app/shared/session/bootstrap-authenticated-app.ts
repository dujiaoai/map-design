import { sessionSchema } from '@repo/auth'
import type { Session } from '@repo/auth'
import { ApiError } from '@repo/api-client'
import type { UserInfo } from '@repo/ruoyi-api'
import { RuoYiApiError } from '@repo/ruoyi-api'

import { useRuoYiProfileStore } from '~/entities/ruoyi-user'
import { api } from '~/shared/api/client'
import { auth } from '~/shared/auth/instance'
import { isSaasAuthEnabled } from '~/shared/config/saas-auth-enabled'
import { createMockUserInfo, isMockAccessToken } from '~/shared/mock/dev-auth'
import { queryClient } from '~/shared/lib/query-client'
import { menuRoutersQueryOptions, userInfoQueryOptions } from '~/shared/queries'

import { clearAppSession } from './clear-app-session'
import { sessionToRuoYiUserInfo } from './saas-session-profile'

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

async function bootstrapSaasAuthenticatedApp(): Promise<UserInfo> {
  const data = sessionSchema.parse(await api.get<Session>('/users/me'))
  const token = auth.getAccessToken()
  const refreshToken = auth.getRefreshToken()

  if (token) {
    auth.setSession(data, {
      accessToken: token,
      refreshToken: refreshToken ?? undefined,
      expiresAt: data.expiresAt,
    })
  }

  const userInfo = sessionToRuoYiUserInfo(data)
  useRuoYiProfileStore.getState().setProfile(userInfo)
  return userInfo
}

/** 受保护应用壳层启动：SaaS `users/me` 或 RuoYi 用户/菜单，并写入 profile store */
export async function bootstrapAuthenticatedApp() {
  if (isMockAccessToken(auth.getAccessToken())) {
    const session = auth.getSession()
    const userInfo = createMockUserInfo(session?.user.name ?? 'dev')
    useRuoYiProfileStore.getState().setProfile(userInfo)
    syncAuthSessionFromUserInfo(userInfo)
    return userInfo
  }

  if (isSaasAuthEnabled()) {
    try {
      return await bootstrapSaasAuthenticatedApp()
    } catch (error) {
      if (error instanceof ApiError && (error.status === 401 || error.status === 403)) {
        clearAppSession()
      }
      throw error
    }
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
