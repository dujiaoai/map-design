import type { Session } from '@repo/auth'

import { auth } from '~/shared/auth/instance'
import { isMockAccessToken } from '~/shared/mock/dev-auth'

import { fetchAndPersistSaasSessionOrClear } from './fetch-saas-session'

function bootstrapMockAuthenticatedApp(): Session {
  const session = auth.getSession()

  if (!session) {
    throw new Error('Mock session missing after devLogin')
  }

  return session
}

/** 受保护应用壳层启动：`GET /v1/users/me`（或 mock 占位），不再请求 RuoYi getInfo / getMenuRouters */
export async function bootstrapAuthenticatedApp(): Promise<Session> {
  if (isMockAccessToken(auth.getAccessToken())) {
    return bootstrapMockAuthenticatedApp()
  }

  return fetchAndPersistSaasSessionOrClear()
}

export { clearAppSession } from './clear-app-session'
