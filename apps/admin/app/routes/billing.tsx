import { AdminComingSoonPage } from '~/shared/ui/admin-coming-soon-page'
import { requireAdminPermissions } from '~/shared/auth/require-admin-permissions'

import type { Route } from './+types/billing'

export function meta(_args: Route.MetaArgs) {
  return [{ title: '计费 · 云眼运营后台' }]
}

export async function clientLoader(_args: Route.ClientLoaderArgs) {
  requireAdminPermissions(['admin:tenants:read'])
  return null
}

export default function BillingRoute() {
  return (
    <AdminComingSoonPage
      title="计费"
      description="租户套餐、用量与账单管理（P4 规划中）。"
    />
  )
}
