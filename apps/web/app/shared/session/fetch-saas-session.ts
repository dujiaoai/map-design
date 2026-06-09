import { sessionSchema, type Session } from '@repo/auth'
import { ApiError } from '@repo/api-client'

import { api } from '~/shared/api/client'
import { auth } from '~/shared/auth/instance'
import { isMockAccessToken } from '~/shared/mock/dev-auth'

import { clearAppSession } from './clear-app-session'
import { persistAuthSession } from './persist-auth-session'

/** 非 mock token 时 bootstrap / 刷新均走 SaaS `GET /v1/users/me` */
export function usesSaasSessionBootstrap(): boolean {
  return !isMockAccessToken(auth.getAccessToken())
}

/** 拉取当前会话并同步 `@repo/auth` */
export async function fetchAndPersistSaasSession(): Promise<Session> {
  const data = sessionSchema.parse(await api.get<Session>('/users/me'))
  persistAuthSession(data)
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
