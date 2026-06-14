import { createBillingClient } from '@repo/billing-client'

import { auth } from '~/shared/auth/client'
import { env } from '~/shared/config/env'
import { resolveBillingApiBaseUrl } from '~/shared/config/billing-api-base-url'
import { handlePaymentRequired } from '~/shared/api/payment-required-bridge'
import { handleAfterAuthRefresh } from '~/shared/api/session-refresh-bridge'

export const billingClient = createBillingClient({
  baseUrl: resolveBillingApiBaseUrl(env.VITE_API_URL),
  auth: {
    getAccessToken: () => auth.getAccessToken(),
    getRefreshToken: () => auth.getRefreshToken(),
    refreshAccessToken: () => auth.refreshAccessToken(),
    onUnauthorized: () => auth.clearSession(),
  },
  onPaymentRequired: handlePaymentRequired,
  onAfterAuthRefresh: handleAfterAuthRefresh,
})

/** @deprecated 使用 billingClient.api */
export const billingApi = billingClient.api
