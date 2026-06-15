import { useState } from 'react'
import { useNavigate } from 'react-router'

import { sessionToNavUserData } from '~/features/account/lib/session-display'
import { selectNotificationItems, selectUnreadNotificationCount, useNotificationStore } from '~/entities/notification'
import { auth } from '~/shared/auth/client'
import { clearAppSession } from '~/shared/session/clear-app-session'
import { useWorkspaceSession } from '~/shared/session/use-workspace-session'

export function useWorkspaceChrome() {
  const navigate = useNavigate()
  const { session, isLoading } = useWorkspaceSession()
  const [accountOpen, setAccountOpen] = useState(false)
  const [notificationOpen, setNotificationOpen] = useState(false)
  const notificationItems = useNotificationStore(selectNotificationItems)
  const notificationUnreadCount = selectUnreadNotificationCount(notificationItems)

  async function handleLogout() {
    try {
      await auth.logout()
    } finally {
      clearAppSession()
      void navigate('/login', { replace: true })
    }
  }

  return {
    user: sessionToNavUserData(session, { loading: isLoading }),
    accountOpen,
    setAccountOpen,
    notificationOpen,
    setNotificationOpen,
    notificationUnreadCount,
    openAccount: () => setAccountOpen(true),
    openNotifications: () => setNotificationOpen(true),
    handleLogout,
  }
}
