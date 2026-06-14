import { createApiClient } from '@repo/api-client'

import { auth } from '~/shared/auth/client'
import { env } from '~/shared/config/env'
import { resolveBillingApiBaseUrl } from '~/shared/config/billing-api-base-url'

export const billingApi = createApiClient({
  baseUrl: resolveBillingApiBaseUrl(env.VITE_API_URL),
  auth: {
    getAccessToken: () => auth.getAccessToken(),
    getRefreshToken: () => auth.getRefreshToken(),
    refreshAccessToken: () => auth.refreshAccessToken(),
    onUnauthorized: () => auth.clearSession(),
  },
})
