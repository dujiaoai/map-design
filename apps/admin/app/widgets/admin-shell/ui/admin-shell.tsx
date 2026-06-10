import { useSession } from '@repo/auth'
import { Button, cn } from '@repo/ui'
import { LogOutIcon, MoonIcon, SunIcon } from 'lucide-react'
import { NavLink, useNavigate } from 'react-router'

import { useTheme } from '~/features/theme'
import { hasAnyPermissionCodes } from '~/shared/auth/admin-access'
import { auth } from '~/shared/auth/client'

import { adminNavItems } from '../lib/nav-items'

export function AdminShell({ children }: { children: React.ReactNode }) {
  const session = useSession()
  const navigate = useNavigate()
  const { theme, toggleTheme } = useTheme()
  const permissions = session?.user.permissions ?? []
  const navItems = adminNavItems.filter((item) =>
    hasAnyPermissionCodes(permissions, item.permissions),
  )

  async function handleLogout() {
    await auth.logout()
    void navigate('/login', { replace: true })
  }

  return (
    <div className="admin-shell min-h-svh bg-background text-foreground">
      <div className="admin-shell-grid" aria-hidden="true" />
      <div className="flex min-h-svh">
        <aside className="admin-sidebar relative z-10 flex w-[248px] shrink-0 flex-col border-r border-border/60 bg-sidebar/95 backdrop-blur-md">
          <div className="border-b border-border/50 px-5 py-6">
            <p className="admin-display text-xs tracking-[0.28em] text-primary/80 uppercase">
              YunYan Ops
            </p>
            <h1 className="admin-display mt-1 text-xl font-semibold tracking-tight">运营控制台</h1>
            <p className="mt-2 truncate text-xs text-muted-foreground">
              {session?.tenant?.name ?? '—'} · {session?.user.email}
            </p>
          </div>

          <nav className="flex flex-1 flex-col gap-1 p-3">
            {navItems.map((item) => (
              <NavLink
                key={item.to}
                to={item.to}
                end={item.to === '/'}
                className={({ isActive }) =>
                  cn(
                    'admin-nav-link flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm transition-colors',
                    isActive
                      ? 'bg-primary/12 text-primary'
                      : 'text-muted-foreground hover:bg-muted/60 hover:text-foreground',
                  )
                }
              >
                <item.icon className="size-4 shrink-0" />
                {item.label}
              </NavLink>
            ))}
          </nav>

          <div className="space-y-2 border-t border-border/50 p-3">
            <Button
              variant="ghost"
              size="sm"
              className="w-full justify-start gap-2"
              onClick={toggleTheme}
            >
              {theme === 'dark' ? <SunIcon className="size-4" /> : <MoonIcon className="size-4" />}
              {theme === 'dark' ? '浅色模式' : '深色模式'}
            </Button>
            <Button
              variant="ghost"
              size="sm"
              className="w-full justify-start gap-2 text-muted-foreground"
              onClick={() => void handleLogout()}
            >
              <LogOutIcon className="size-4" />
              退出登录
            </Button>
          </div>
        </aside>

        <main className="relative z-10 min-w-0 flex-1">
          <div className="mx-auto max-w-6xl px-6 py-8 md:px-10 md:py-10">{children}</div>
        </main>
      </div>
    </div>
  )
}
