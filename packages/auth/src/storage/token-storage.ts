import type { Session, StorageLike, TokenPair } from '../types'
import { sessionSchema } from '../types'

function keys(prefix: string) {
  return {
    access: `${prefix}:access-token`,
    refresh: `${prefix}:refresh-token`,
    session: `${prefix}:session`,
  }
}

export function createTokenStorage(prefix: string, storage: StorageLike) {
  const k = keys(prefix)

  return {
    getAccessToken(): string | null {
      return storage.getItem(k.access)
    },

    getRefreshToken(): string | null {
      return storage.getItem(k.refresh)
    },

    getSession(): Session | null {
      const raw = storage.getItem(k.session)
      if (!raw) return null
      try {
        return sessionSchema.parse(JSON.parse(raw))
      } catch {
        return null
      }
    },

    setTokens(tokens: TokenPair) {
      storage.setItem(k.access, tokens.accessToken)
      if (tokens.refreshToken) {
        storage.setItem(k.refresh, tokens.refreshToken)
      }
    },

    setSession(session: Session) {
      storage.setItem(k.session, JSON.stringify(session))
    },

    persist(session: Session, tokens: TokenPair) {
      this.setSession(session)
      this.setTokens(tokens)
    },

    clear() {
      storage.removeItem(k.access)
      storage.removeItem(k.refresh)
      storage.removeItem(k.session)
    },

    isAuthenticated(): boolean {
      return Boolean(this.getAccessToken())
    },
  }
}

export type TokenStorage = ReturnType<typeof createTokenStorage>
