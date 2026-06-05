import { createAuth } from '@haoxuan/auth'

import { useRuoYiProfileStore } from '~/entities/ruoyi-user'
import { env } from '~/shared/config/env'
import { removeSessionQueries } from '~/shared/queries/invalidate-session-queries'

export const auth = createAuth({
  storageKeyPrefix: 'saas-web',
  apiBaseUrl: env.VITE_API_URL,
  onUnauthorized: () => {
    useRuoYiProfileStore.getState().clear()
    removeSessionQueries()
  },
})
