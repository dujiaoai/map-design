import { createContext, useContext, useMemo } from 'react'

import type { AuthClient } from '../create-auth'
import type { SessionTenant } from '../types'
import { useSession } from './session-context'

interface TenantContextValue {
  tenant: SessionTenant | null
  setTenant: (tenant: SessionTenant | null) => void
}

const TenantContext = createContext<TenantContextValue | null>(null)

export function TenantProvider({
  auth,
  children,
}: {
  auth: AuthClient
  children: React.ReactNode
}) {
  const session = useSession()

  const value = useMemo<TenantContextValue>(
    () => ({
      tenant: session?.tenant ?? null,
      setTenant: (tenant) => auth.setTenant(tenant),
    }),
    [auth, session?.tenant],
  )

  return <TenantContext.Provider value={value}>{children}</TenantContext.Provider>
}

export function useTenant(): TenantContextValue {
  const ctx = useContext(TenantContext)
  if (!ctx) {
    throw new Error('useTenant 须在 TenantProvider 内使用')
  }
  return ctx
}
