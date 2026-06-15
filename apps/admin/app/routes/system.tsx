import { SystemAdminPage } from '~/features/system/ui/system-admin-page'
import { requireAdminPermissions } from '~/shared/auth/require-admin-permissions'

import type { Route } from './+types/system'

export function meta(_args: Route.MetaArgs) {
  return [{ title: '系统 · 云眼运营后台' }]
}

export async function clientLoader(_args: Route.ClientLoaderArgs) {
  requireAdminPermissions(['admin:tenants:read'])
  return null
}

export default function SystemRoute() {
  return <SystemAdminPage />
}
