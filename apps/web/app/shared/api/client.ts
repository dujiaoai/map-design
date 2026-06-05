import { createApiClient } from '@haoxuan/api-client'

import { auth } from '~/shared/auth/client'
import { env } from '~/shared/config/env'

export const api = createApiClient({
  baseUrl: env.VITE_API_URL ?? '/YunYanApi',
  auth: {
    getAccessToken: () => auth.getAccessToken(),
    getRefreshToken: () => auth.getRefreshToken(),
    refreshAccessToken: () => auth.refreshAccessToken(),
    onUnauthorized: () => auth.clearSession(),
  },
})
