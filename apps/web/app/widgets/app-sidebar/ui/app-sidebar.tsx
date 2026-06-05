import type { ComponentProps } from 'react'
import { useMemo, useState } from 'react'

import { AppSidebar as UiAppSidebar } from '@haoxuan/ui'
import { useNavigate } from 'react-router'

import {
  buildNavMapSections,
  mockNavMainItems,
  mockNavMapSectionDefs,
} from '~/entities/navigation'
import { selectUnreadNotificationCount, useNotificationStore } from '~/entities/notification'
import { toNavUserData, useRuoYiProfile } from '~/entities/ruoyi-user'
import {
  createNavSelectHandler,
  useActiveNavItemIds,
  useMapWorkspaceStore,
} from '~/features/map-workspace'
import { auth } from '~/shared/auth/client'
import { clearAppSession } from '~/shared/session/clear-app-session'
import { AccountSheet } from '~/widgets/account-sheet'
import { NotificationSheet } from '~/widgets/notification-sheet'

export function AppSidebar(props: ComponentProps<typeof UiAppSidebar>) {
  const navigate = useNavigate()
  const { user, isLoading } = useRuoYiProfile()
  const [accountOpen, setAccountOpen] = useState(false)
  const [notificationOpen, setNotificationOpen] = useState(false)
  const notificationItems = useNotificationStore((state) => state.items)
  const notificationUnreadCount = selectUnreadNotificationCount(notificationItems)
  const activeNavItemIds = useActiveNavItemIds()
  const togglePanelTool = useMapWorkspaceStore((state) => state.togglePanelTool)
  const toggleMapTool = useMapWorkspaceStore((state) => state.toggleMapTool)
  const toggleMapModule = useMapWorkspaceStore((state) => state.toggleMapModule)
  const toggleMapDockModule = useMapWorkspaceStore((state) => state.toggleMapDockModule)

  const navMapSections = useMemo(
    () => buildNavMapSections(mockNavMapSectionDefs, activeNavItemIds),
    [activeNavItemIds],
  )

  const handleNavSelect = useMemo(
    () =>
      createNavSelectHandler({
        items: mockNavMainItems,
        navigate,
        togglePanelTool,
        toggleMapTool,
        toggleMapModule,
        toggleMapDockModule,
      }),
    [navigate, toggleMapDockModule, toggleMapModule, toggleMapTool, togglePanelTool],
  )

  async function handleLogout() {
    try {
      await auth.logout()
    } finally {
      clearAppSession()
      void navigate('/login', { replace: true })
    }
  }

  return (
    <>
      <UiAppSidebar
        user={toNavUserData(user, { loading: isLoading })}
        navMapSections={navMapSections}
        onNavSelect={handleNavSelect}
        onAccountClick={() => setAccountOpen(true)}
        onNotificationsClick={() => setNotificationOpen(true)}
        notificationUnreadCount={notificationUnreadCount}
        onLogout={() => void handleLogout()}
        {...props}
      />
      <AccountSheet open={accountOpen} onOpenChange={setAccountOpen} />
      <NotificationSheet open={notificationOpen} onOpenChange={setNotificationOpen} />
    </>
  )
}
