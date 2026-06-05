import { useState } from 'react'
import { useNavigate } from 'react-router'

import { selectUnreadNotificationCount, useNotificationStore } from '~/entities/notification'
import { toNavUserData, useRuoYiProfile } from '~/entities/ruoyi-user'
import { auth } from '~/shared/auth/client'
import { clearAppSession } from '~/shared/session/clear-app-session'

export function useWorkspaceChrome() {
  const navigate = useNavigate()
  const { user, isLoading } = useRuoYiProfile()
  const [accountOpen, setAccountOpen] = useState(false)
  const [notificationOpen, setNotificationOpen] = useState(false)
  const notificationItems = useNotificationStore((state) => state.items)
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
    user: toNavUserData(user, { loading: isLoading }),
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
