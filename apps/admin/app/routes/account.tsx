import { AccountAdminPage } from '~/features/account/ui/account-admin-page'
import { hasAdminAccess } from '~/shared/auth/admin-access'
import { auth } from '~/shared/auth/client'
import { redirect } from 'react-router'

import type { Route } from './+types/account'

export function meta(_args: Route.MetaArgs) {
  return [{ title: '账号设置 · 云眼运营后台' }]
}

export async function clientLoader(_args: Route.ClientLoaderArgs) {
  auth.hydrateSession()
  if (!hasAdminAccess(auth.getSession())) {
    throw redirect('/403')
  }
  return null
}

export default function AccountRoute() {
  return <AccountAdminPage />
}
