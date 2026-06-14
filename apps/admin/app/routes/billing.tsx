import { BillingAdminPage } from '~/features/billing/ui/billing-admin-page'
import { requireAdminPermissions } from '~/shared/auth/require-admin-permissions'

import type { Route } from './+types/billing'

export function meta(_args: Route.MetaArgs) {
  return [{ title: '计费 · 云眼运营后台' }]
}

export async function clientLoader(_args: Route.ClientLoaderArgs) {
  requireAdminPermissions(['admin:billing:adjust'])
  return null
}

export default function BillingRoute() {
  return <BillingAdminPage />
}
