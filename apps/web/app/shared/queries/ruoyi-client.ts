import { createRuoYiClient } from '@repo/ruoyi-api'

import { auth } from '~/shared/auth/client'
import { env } from '~/shared/config/env'

export const ruoyi = createRuoYiClient({
  baseUrl: env.VITE_API_URL ?? '/YunYanApi',
  getAccessToken: () => auth.getAccessToken(),
})
