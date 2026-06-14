import { createApiClient } from '@repo/api-client'

import { auth } from '~/shared/auth/client'
import { env } from '~/shared/config/env'
import { resolveSaasApiBaseUrl } from '~/shared/config/saas-api-base-url'
import { handlePaymentRequired } from '~/shared/api/payment-required-bridge'
import { handleAfterAuthRefresh } from '~/shared/api/session-refresh-bridge'

export const api = createApiClient({
  baseUrl: resolveSaasApiBaseUrl(env.VITE_API_URL),
  auth: {
    getAccessToken: () => auth.getAccessToken(),
    getRefreshToken: () => auth.getRefreshToken(),
    refreshAccessToken: () => auth.refreshAccessToken(),
    onUnauthorized: () => auth.clearSession(),
  },
  onPaymentRequired: handlePaymentRequired,
  onAfterAuthRefresh: handleAfterAuthRefresh,
})
