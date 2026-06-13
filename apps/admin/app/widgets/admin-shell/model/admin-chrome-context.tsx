import { useSession } from '@repo/auth'
import { createContext, useCallback, useContext, useMemo, useState, type ReactNode } from 'react'
import { useNavigate } from 'react-router'

import { auth } from '~/shared/auth/client'
import { sessionToNavUserData } from '~/shared/auth/session-display'

type AdminChromeContextValue = {
  user: ReturnType<typeof sessionToNavUserData>
  accountOpen: boolean
  setAccountOpen: (open: boolean) => void
  openAccount: () => void
  handleLogout: () => Promise<void>
}

const AdminChromeContext = createContext<AdminChromeContextValue | null>(null)

export function AdminChromeProvider({ children }: { children: ReactNode }) {
  const navigate = useNavigate()
  const session = useSession()
  const [accountOpen, setAccountOpen] = useState(false)

  const handleLogout = useCallback(async () => {
    await auth.logout()
    void navigate('/login', { replace: true })
  }, [navigate])

  const openAccount = useCallback(() => {
    setAccountOpen(true)
  }, [])

  const value = useMemo(
    () => ({
      user: sessionToNavUserData(session),
      accountOpen,
      setAccountOpen,
      openAccount,
      handleLogout,
    }),
    [accountOpen, handleLogout, openAccount, session],
  )

  return <AdminChromeContext.Provider value={value}>{children}</AdminChromeContext.Provider>
}

export function useAdminChrome() {
  const context = useContext(AdminChromeContext)
  if (!context) {
    throw new Error('useAdminChrome must be used within AdminChromeProvider')
  }
  return context
}
