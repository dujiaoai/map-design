import { SidebarInset, SidebarProvider } from '@repo/ui'

import { AdminAccountSheet } from '~/widgets/account-sheet'

import { AdminChromeProvider, useAdminChrome } from '../model/admin-chrome-context'
import { AdminAppSidebar } from './admin-app-sidebar'
import { AdminShellHeader } from './admin-shell-header'

function AdminShellLayout({ children }: { children: React.ReactNode }) {
  const { accountOpen, setAccountOpen } = useAdminChrome()

  return (
    <div className="admin-shell min-h-svh bg-background text-foreground">
      <div className="admin-shell-grid" aria-hidden="true" />
      <SidebarProvider className="relative z-10 min-h-svh">
        <AdminAppSidebar />
        <SidebarInset className="flex min-h-svh flex-col">
          <AdminShellHeader />
          <div className="mx-auto w-full max-w-6xl flex-1 px-6 py-8 md:px-10 md:py-10">{children}</div>
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
