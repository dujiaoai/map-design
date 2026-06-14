import { PermissionsAdminPage } from '~/features/permissions/ui/permissions-admin-page'
import { requireAdminPermissions } from '~/shared/auth/require-admin-permissions'

import type { Route } from './+types/permissions'

export function meta(_args: Route.MetaArgs) {
  return [{ title: '权限目录 · 云眼运营后台' }]
}

export async function clientLoader(_args: Route.ClientLoaderArgs) {
  requireAdminPermissions(['admin:roles:read'])
  return null
}

export default function PermissionsRoute() {
  return <PermissionsAdminPage />
}
