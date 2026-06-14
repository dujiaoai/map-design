import { createApiClient } from '@repo/api-client'

import { auth } from '~/shared/auth/client'
import { env } from '~/shared/config/env'
import { resolveBillingAdminApiBaseUrl } from '~/shared/config/billing-admin-api-base-url'
import { resolveSaasApiBaseUrl } from '~/shared/config/saas-api-base-url'

export const billingAdminApi = createApiClient({
  baseUrl: resolveBillingAdminApiBaseUrl(resolveSaasApiBaseUrl(env.VITE_API_URL)),
  auth: {
    getAccessToken: () => auth.getAccessToken(),
    getRefreshToken: () => auth.getRefreshToken(),
    refreshAccessToken: () => auth.refreshAccessToken(),
    onUnauthorized: () => auth.clearSession(),
  },
})
