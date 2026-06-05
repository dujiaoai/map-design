import { Outlet, redirect } from 'react-router'

import { auth } from '~/shared/auth/client'
import { bootstrapAuthenticatedApp } from '~/shared/session/bootstrap-authenticated-app'
import { TenantSessionSync } from '~/shared/session/tenant-session-sync'

import type { Route } from './+types/app-layout'

export async function clientLoader(_args: Route.ClientLoaderArgs) {
  auth.requireAuthenticated(redirect)

  try {
    await bootstrapAuthenticatedApp()
  } catch {
    throw redirect('/login')
  }

  return null
}

export default function AppLayout() {
  return (
    <>
      <TenantSessionSync />
      <Outlet />
    </>
  )
}
