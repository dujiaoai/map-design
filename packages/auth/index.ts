export {
  AUTH_PASSWORD_MAX_LENGTH,
  AUTH_PASSWORD_MIN_LENGTH,
  authPasswordFieldSchema,
} from './src/password-policy'
export { type AuthApi, type AuthApiOptions, createAuthApi } from './src/auth-api'
export { type AuthClient, type CreateAuthOptions, createAuth } from './src/create-auth'
export { SessionProvider, useIsAuthenticated, useSession } from './src/react/session-context'
export { TenantProvider, useTenant } from './src/react/tenant-provider'
export { hasAnyRole, hasRole, requireAuthenticated, requireRole } from './src/session/roles'
export {
  hasAnyPermission,
  hasPermission,
  requirePermission,
} from './src/session/permissions'
export { PermissionCodes, type PermissionCode, ROLE_DEFAULT_PERMISSIONS } from './src/permission-codes'
export { resolvePermissionsForRoles } from './src/session/resolve-role-permissions'
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
