import { createAuthApi } from './auth-api'
import { authTokensToTokenPair, loginResponseToSession } from './map-auth-response'
import { requireAuthenticated, requireRole } from './session/roles'
import { createSessionStore } from './session/session-store'
import { createTokenStorage } from './storage/token-storage'
import type {
  LoginCredentials,
  RegisterCredentials,
  RedirectFn,
  SaaSRole,
  Session,
  SessionTenant,
  StorageLike,
  TokenPair,
} from './types'
import { SaaSRole as Role, authTokensSchema, loginResponseSchema } from './types'

export interface CreateAuthOptions {
  storageKeyPrefix: string
  storage?: StorageLike
  apiBaseUrl?: string
  onUnauthorized?: () => void
}

function memoryStorage(): StorageLike {
  const map = new Map<string, string>()
  return {
    getItem: (key) => map.get(key) ?? null,
    setItem: (key, value) => {
      map.set(key, value)
    },
    removeItem: (key) => {
      map.delete(key)
    },
  }
}

function resolveStorage(storage?: StorageLike): StorageLike {
  if (storage) return storage
  if (typeof localStorage !== 'undefined') return localStorage
  return memoryStorage()
}

export function createAuth(options: CreateAuthOptions) {
  const storage = createTokenStorage(options.storageKeyPrefix, resolveStorage(options.storage))
  const store = createSessionStore(storage)
  const authApi = options.apiBaseUrl ? createAuthApi({ baseUrl: options.apiBaseUrl }) : null

  let refreshPromise: Promise<string | null> | null = null

  function persist(session: Session, tokens: TokenPair) {
    storage.persist(session, tokens)
    store.getState().setSession(session)
  }

  return {
    SaaSRole: Role,

    getAccessToken: () => storage.getAccessToken(),
    getRefreshToken: () => storage.getRefreshToken(),
    getSession: () => storage.getSession(),
    isAuthenticated: () => storage.isAuthenticated(),

    hydrateSession() {
      store.getState().hydrate()
    },

    setSession(session: Session, tokens: TokenPair) {
      persist(session, tokens)
    },

    clearSession() {
      store.getState().clear()
      options.onUnauthorized?.()
    },

    async login(credentials: LoginCredentials): Promise<Session> {
      if (!authApi) throw new Error('未配置 apiBaseUrl，无法调用登录接口')
      const response = loginResponseSchema.parse(await authApi.login(credentials))
      const session = loginResponseToSession(response)
      persist(session, authTokensToTokenPair(response))
      return session
    },

    async register(credentials: RegisterCredentials): Promise<Session> {
      if (!authApi) throw new Error('未配置 apiBaseUrl，无法调用注册接口')
      const response = loginResponseSchema.parse(await authApi.register(credentials))
      const session = loginResponseToSession(response)
      persist(session, authTokensToTokenPair(response))
      return session
    },

    async logout(): Promise<void> {
      const token = storage.getAccessToken()
      if (token && authApi) {
        try {
          await authApi.logout(token)
        } catch {
          // 登出接口失败仍清除本地会话
        }
      }
      store.getState().clear()
    },

    /** 开发占位：写入本地会话，不请求后端 */
    devLogin(session: Session, tokens: TokenPair) {
      persist(session, tokens)
    },

    async refreshAccessToken(): Promise<string | null> {
      if (!authApi) return null
      const refreshToken = storage.getRefreshToken()
      if (!refreshToken) return null

      if (!refreshPromise) {
        refreshPromise = authApi
          .refresh(refreshToken)
          .then((raw) => {
            const tokens = authTokensSchema.parse(raw)
            storage.setTokens(authTokensToTokenPair(tokens))
            return tokens.accessToken
          })
          .catch(() => {
            store.getState().clear()
            options.onUnauthorized?.()
            return null
          })
          .finally(() => {
            refreshPromise = null
          })
      }

      return refreshPromise
    },

    requireAuthenticated(redirect: RedirectFn) {
      requireAuthenticated(storage.isAuthenticated(), redirect)
    },

    requireRole(session: Session | null, allowed: SaaSRole | SaaSRole[], redirect: RedirectFn) {
      return requireRole(session, allowed, redirect)
    },

    setTenant(tenant: SessionTenant | null) {
      store.getState().setTenant(tenant)
    },

    /** 改密后服务端已吊销 refresh，清除本地副本 */
    clearRefreshToken() {
      storage.clearRefreshToken()
    },

    store,
    storage,
  }
}

export type AuthClient = ReturnType<typeof createAuth>
