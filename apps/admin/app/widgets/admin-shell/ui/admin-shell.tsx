import { SidebarInset, SidebarProvider } from '@repo/ui'

import { AdminAccountSheet } from '~/widgets/account-sheet'

import { AdminChromeProvider, useAdminChrome } from '../model/admin-chrome-context'
import { AdminAppSidebar } from './admin-app-sidebar'
import { AdminShellHeader } from './admin-shell-header'

function AdminShellLayout({ children }: { children: React.ReactNode }) {
  const { accountOpen, setAccountOpen } = useAdminChrome()

  return (
    <div className="admin-shell h-dvh overflow-hidden bg-background text-foreground">
      <div className="admin-shell-grid" aria-hidden="true" />
      <SidebarProvider className="relative z-10 flex h-full min-h-0 w-full">
        <AdminAppSidebar />
        <SidebarInset className="flex h-full min-h-0 flex-col overflow-hidden">
          <AdminShellHeader />
          <div className="admin-scroll-area min-h-0 flex-1 w-full">
            <div className="admin-shell-main-inner">{children}</div>
          </div>
        </SidebarInset>
      </SidebarProvider>
      <AdminAccountSheet open={accountOpen} onOpenChange={setAccountOpen} />
    </div>
  )
}

export function AdminShell({ children }: { children: React.ReactNode }) {
  return (
    <AdminChromeProvider>
      <AdminShellLayout>{children}</AdminShellLayout>
    </AdminChromeProvider>
  )
}
