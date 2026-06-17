import { createContext, useContext, useEffect, useMemo, useSyncExternalStore } from 'react'

import type { AuthClient } from '../create-auth'
import type { Session } from '../types'

const AuthClientContext = createContext<AuthClient | null>(null)

export function SessionProvider({
  auth,
  children,
}: {
  auth: AuthClient
  children: React.ReactNode
}) {
  if (typeof window !== 'undefined') {
    auth.hydrateSession()
  }

  useEffect(() => {
    auth.hydrateSession()
  }, [auth])

  const value = useMemo(() => auth, [auth])

  return <AuthClientContext.Provider value={value}>{children}</AuthClientContext.Provider>
}

function useAuthClient(): AuthClient {
  const client = useContext(AuthClientContext)
  if (!client) {
    throw new Error('useSession 须在 SessionProvider 内使用')
  }
  return client
}

export function useSession(): Session | null {
  const auth = useAuthClient()
  return useSyncExternalStore(
    (onStoreChange) => auth.store.subscribe(onStoreChange),
    () => auth.store.getState().session,
    () => null,
  )
}

export function useIsAuthenticated(): boolean {
  const auth = useAuthClient()
  return useSyncExternalStore(
    (onStoreChange) => auth.store.subscribe(onStoreChange),
    () => auth.isAuthenticated(),
    () => false,
  )
}
