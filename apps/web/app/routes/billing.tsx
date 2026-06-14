import { PermissionCodes } from '@repo/auth'
import { redirect } from 'react-router'

import { BillingPageContent } from '~/features/billing'
import { auth } from '~/shared/auth/client'
import { bootstrapAuthenticatedApp } from '~/shared/session/bootstrap-authenticated-app'
import { requireWorkspaceAccess } from '~/shared/session/require-workspace-access'

import type { Route } from './+types/billing'

export function meta(_args: Route.MetaArgs) {
  return [{ title: '积分与计费 · 云眼地图' }]
}

export async function clientLoader(_args: Route.ClientLoaderArgs) {
  auth.requireAuthenticated(redirect)

  try {
    await bootstrapAuthenticatedApp()
  } catch {
    throw redirect('/login')
  }

  requireWorkspaceAccess()
  auth.requirePermission(auth.getSession(), PermissionCodes.BILLING_WALLET_READ, redirect)

  return null
}

export default function BillingRoute() {
  return (
    <main className="min-h-svh bg-background">
      <BillingPageContent />
    </main>
  )
}
