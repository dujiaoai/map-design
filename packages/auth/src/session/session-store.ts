import { createStore } from 'zustand/vanilla'
import type { TokenStorage } from '../storage/token-storage'
import type { Session, SessionTenant } from '../types'

export interface SessionState {
  session: Session | null
  hydrated: boolean
}

export interface SessionActions {
  hydrate: () => void
  setSession: (session: Session) => void
  setTenant: (tenant: SessionTenant | null) => void
  clear: () => void
}

export function createSessionStore(storage: TokenStorage) {
  return createStore<SessionState & SessionActions>((set, get) => ({
    session: null,
    hydrated: false,

    hydrate() {
      if (get().hydrated) return
      set({ session: storage.getSession(), hydrated: true })
    },

    setSession(session) {
      set({ session, hydrated: true })
    },

    setTenant(tenant) {
      const current = get().session
      if (!current) return
      const next = { ...current, tenant }
      storage.setSession(next)
      set({ session: next })
    },

    clear() {
      if (get().session === null && !storage.isAuthenticated()) {
        return
      }
      storage.clear()
      set({ session: null, hydrated: true })
    },
  }))
}

export type SessionStore = ReturnType<typeof createSessionStore>
