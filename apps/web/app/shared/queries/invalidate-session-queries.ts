import { menuQueryKeys, userQueryKeys } from '~/shared/queries'
import { queryClient } from '~/shared/lib/query-client'

/** 登出 / 401 / 租户切换时使会话相关 Query 失效 */
export function invalidateSessionQueries() {
  return queryClient.invalidateQueries({ queryKey: userQueryKeys.all }).then(() =>
    queryClient.invalidateQueries({ queryKey: menuQueryKeys.all }),
  )
}

export function removeSessionQueries() {
  queryClient.removeQueries({ queryKey: userQueryKeys.all })
  queryClient.removeQueries({ queryKey: menuQueryKeys.all })
}
