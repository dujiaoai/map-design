import { TenantsAdminPage } from '~/features/tenants/ui/tenants-admin-page'
import { requireAdminPermissions } from '~/shared/auth/require-admin-permissions'

import type { Route } from './+types/tenants'

export function meta(_args: Route.MetaArgs) {
  return [{ title: '租户 · 云眼运营后台' }]
}

export async function clientLoader(_args: Route.ClientLoaderArgs) {
  requireAdminPermissions(['admin:tenants:read'])
  return null
}

export default function TenantsRoute() {
  return <TenantsAdminPage />
}
