import { billingQueryKeys } from '~/shared/queries/billing-queries'
import { sessionQueryKeys } from '~/shared/queries/session-queries'
import { tenantQueryKeys } from '~/shared/queries/tenant-queries'
import { queryClient } from '~/shared/lib/query-client'

/** 登出 / 401 / 租户切换时使会话相关 Query 失效 */
export function invalidateSessionQueries() {
  return queryClient
    .invalidateQueries({ queryKey: sessionQueryKeys.all })
    .then(() => queryClient.invalidateQueries({ queryKey: tenantQueryKeys.all }))
    .then(() => queryClient.invalidateQueries({ queryKey: billingQueryKeys.all }))
}

export function removeSessionQueries() {
  queryClient.removeQueries({ queryKey: sessionQueryKeys.all })
  queryClient.removeQueries({ queryKey: tenantQueryKeys.all })
  queryClient.removeQueries({ queryKey: billingQueryKeys.all })
}
