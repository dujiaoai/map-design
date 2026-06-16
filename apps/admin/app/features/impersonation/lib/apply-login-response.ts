import { authTokensToTokenPair, loginResponseSchema, loginResponseToSession } from '@repo/auth'

import { auth } from '~/shared/auth/instance'

export function applyLoginResponse(raw: unknown) {
  const response = loginResponseSchema.parse(raw)
  auth.setSession(loginResponseToSession(response), authTokensToTokenPair(response))
  return response
}
