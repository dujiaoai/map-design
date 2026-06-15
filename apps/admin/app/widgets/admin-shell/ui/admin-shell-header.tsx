import { Separator, SidebarTrigger } from '@repo/ui'
import { useLocation } from 'react-router'

import { useAdminShellTitle } from '../lib/use-admin-shell-title'
import { useAdminChrome } from '../model/admin-chrome-context'
import { AdminHeaderActions } from './admin-header-actions'

export function AdminShellHeader() {
  const { pathname } = useLocation()
  const { user, openAccount, handleLogout } = useAdminChrome()
  const pageTitle = useAdminShellTitle(pathname)

  return (
    <header className="admin-shell-header flex h-12 shrink-0 items-center gap-2 border-b border-border/60 px-2 sm:px-3">
      <div className="admin-shell-header-lead flex min-w-0 flex-1 items-center gap-2 sm:gap-2.5">
        <SidebarTrigger className="admin-shell-header-trigger shrink-0" />
        <Separator orientation="vertical" className="admin-shell-header-divider mx-0 h-4 shrink-0" />
        <span className="admin-shell-header-title admin-display min-w-0 truncate font-medium">
          {pageTitle}
        </span>
      </div>
      <div className="ml-auto flex h-8 shrink-0 items-center">
        <AdminHeaderActions
          user={user}
          onAccountClick={openAccount}
          onLogout={() => void handleLogout()}
        />
      </div>
    </header>
  )
}
