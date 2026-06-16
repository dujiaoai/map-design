export {
  AUTH_PASSWORD_MAX_LENGTH,
  AUTH_PASSWORD_MIN_LENGTH,
  AUTH_PASSWORD_STRENGTH_REGEX,
  authChangePasswordSchema,
  authPasswordFieldSchema,
  isAuthPasswordStrengthRequired,
} from './src/password-policy'
export { authProfileFormSchema, authResetPasswordSchema } from './src/account-schemas'
export {
  AUTH_API_DETAIL_LOCALIZATIONS,
  type FormatAuthApiErrorOptions,
  formatAuthApiError,
} from './src/format-auth-api-error'
export { type AuthApi, type AuthApiOptions, createAuthApi } from './src/auth-api'
export { LoginMfaRequiredError, isLoginMfaRequiredError } from './src/login-mfa-error'
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
export { authTokensToTokenPair, loginResponseToSession, loginResponseToTokenPair } from './src/map-auth-response'
export {
  type AuthTokensResponse,
  authTokensSchema,
  type LoginCredentials,
  type LoginMfaCredentials,
  type OidcAuthorizeResponse,
  type OidcCallbackCredentials,
  type LoginResponse,
  type RegisterCredentials,
  type RegisterOrgCredentials,
  type RegisterOrgResponse,
  type RegisterPersonalCredentials,
  type RegisterPersonalResponse,
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
