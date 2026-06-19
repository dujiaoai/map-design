import { createAuth } from '@repo/auth'

import { env } from '~/shared/config/env'
import { resolveSaasApiBaseUrl } from '~/shared/config/saas-api-base-url'
import { redirectToAdminLogin } from '~/shared/auth/redirect-to-admin-login'

export const auth = createAuth({
  storageKeyPrefix: 'saas-admin',
  apiBaseUrl: env.VITE_API_URL ? resolveSaasApiBaseUrl(env.VITE_API_URL) : undefined,
  onUnauthorized: () => {
    auth.clearSession()
    redirectToAdminLogin()
  },
})
