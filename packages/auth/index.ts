export { type AuthApi, type AuthApiOptions, createAuthApi } from './src/auth-api'
export { type AuthClient, type CreateAuthOptions, createAuth } from './src/create-auth'
export { SessionProvider, useIsAuthenticated, useSession } from './src/react/session-context'
export { TenantProvider, useTenant } from './src/react/tenant-provider'
export { hasAnyRole, hasRole, requireAuthenticated, requireRole } from './src/session/roles'
export { createTokenStorage, type TokenStorage } from './src/storage/token-storage'
export { authTokensToTokenPair, loginResponseToSession } from './src/map-auth-response'
export {
  type AuthTokensResponse,
  authTokensSchema,
  type LoginCredentials,
  type LoginResponse,
  type RegisterCredentials,
  loginResponseSchema,
  type RedirectFn,
  SaaSRole,
  type Session,
  type SessionTenant,
  type SessionUser,
  type StorageLike,
  sessionSchema,
  sessionTenantSchema,
  sessionUserSchema,
  type TokenPair,
} from './src/types'
