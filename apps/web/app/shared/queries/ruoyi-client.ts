import { createRuoYiClient } from '@repo/ruoyi-api'

import { auth } from '~/shared/auth/client'

export const ruoyi = createRuoYiClient({
  baseUrl: '/YunYanApi',
  getAccessToken: () => auth.getAccessToken(),
})
