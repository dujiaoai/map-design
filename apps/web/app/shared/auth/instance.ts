import { createAuth } from '@repo/auth'

import { env } from '~/shared/config/env'
import { resolveSaasApiBaseUrl } from '~/shared/config/saas-api-base-url'
import { removeSessionQueries } from '~/shared/queries/invalidate-session-queries'

export const auth = createAuth({
  storageKeyPrefix: 'saas-web',
  apiBaseUrl: env.VITE_API_URL ? resolveSaasApiBaseUrl(env.VITE_API_URL) : undefined,
  onUnauthorized: () => {
    removeSessionQueries()
  },
})
