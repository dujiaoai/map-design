import type { AuthTokensResponse, LoginResponse, Session, TokenPair } from './types'

export function loginResponseToSession(response: LoginResponse): Session {
  const { tenant, ...user } = response.user
  return {
    user,
    tenant,
    homeTenant: response.homeTenant ?? undefined,
    expiresAt: Date.now() + response.expiresIn * 1000,
  }
}

export function authTokensToTokenPair(tokens: AuthTokensResponse): TokenPair {
  return {
    accessToken: tokens.accessToken,
    refreshToken: tokens.refreshToken,
    expiresIn: tokens.expiresIn,
    expiresAt: Date.now() + tokens.expiresIn * 1000,
  }
}
