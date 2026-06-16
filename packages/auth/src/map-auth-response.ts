import { authTokensSchema, type AuthTokensResponse, type LoginResponse, type Session, type TokenPair } from './types'

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

/** 从完整登录响应提取 TokenPair；缺少 token 时由 schema 校验失败 */
export function loginResponseToTokenPair(response: LoginResponse): TokenPair {
  return authTokensToTokenPair(
    authTokensSchema.parse({
      accessToken: response.accessToken,
      refreshToken: response.refreshToken,
      expiresIn: response.expiresIn,
    }),
  )
}
