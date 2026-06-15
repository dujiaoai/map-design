import { Outlet, redirect } from 'react-router'

import { auth } from '~/shared/auth/client'
import { hasAdminAccess } from '~/shared/auth/admin-access'
import { AdminShell } from '~/widgets/admin-shell/ui/admin-shell'

import type { Route } from './+types/admin-layout'

export function links() {
  return [
    { rel: 'preconnect', href: 'https://fonts.googleapis.com' },
    { rel: 'preconnect', href: 'https://fonts.gstatic.com', crossOrigin: 'anonymous' as const },
    {
      rel: 'stylesheet',
      href: 'https://fonts.googleapis.com/css2?family=IBM+Plex+Mono:wght@400;500&family=Noto+Sans+SC:wght@400;500;600&family=Syne:wght@500;600;700&display=swap',
    },
  ]
}

export async function clientLoader(_args: Route.ClientLoaderArgs) {
  auth.hydrateSession()
  auth.requireAuthenticated(redirect)

  const session = auth.getSession()
  if (!hasAdminAccess(session)) {
    throw redirect('/403')
  }

  return null
}

export default function AdminLayout() {
  return (
    <AdminShell>
      <Outlet />
    </AdminShell>
  )
}
