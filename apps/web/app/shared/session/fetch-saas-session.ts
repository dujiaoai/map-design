import { sessionSchema, type Session } from '@repo/auth'
import { ApiError } from '@repo/api-client'

import { useRuoYiProfileStore } from '~/entities/ruoyi-user'
import { api } from '~/shared/api/client'
import { auth } from '~/shared/auth/instance'
import { isMockAccessToken } from '~/shared/mock/dev-auth'

import { clearAppSession } from './clear-app-session'
import { sessionToRuoYiUserInfo } from './saas-session-profile'

/** 非 mock token 时 bootstrap / 刷新均走 SaaS `GET /v1/users/me` */
export function usesSaasSessionBootstrap(): boolean {
  return !isMockAccessToken(auth.getAccessToken())
}

/** 拉取当前会话、同步 `@repo/auth` 与过渡期 profile store */
export async function fetchAndPersistSaasSession(): Promise<Session> {
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

  useRuoYiProfileStore.getState().setProfile(sessionToRuoYiUserInfo(data))
  return data
}

export async function fetchAndPersistSaasSessionOrClear(): Promise<Session> {
  try {
    return await fetchAndPersistSaasSession()
  } catch (error) {
    if (error instanceof ApiError && (error.status === 401 || error.status === 403)) {
      clearAppSession()
    }
    throw error
  }
}
