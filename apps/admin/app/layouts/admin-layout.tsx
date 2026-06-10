import { Outlet, redirect } from 'react-router'

import { auth } from '~/shared/auth/client'
import { hasAdminAccess } from '~/shared/auth/admin-access'
import { AdminShell } from '~/widgets/admin-shell/ui/admin-shell'

import type { Route } from './+types/admin-layout'

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
