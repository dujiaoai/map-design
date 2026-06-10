import { RolesAdminPage } from '~/features/roles/ui/roles-admin-page'
import { requireAdminPermissions } from '~/shared/auth/require-admin-permissions'

import type { Route } from './+types/roles'

export function meta(_args: Route.MetaArgs) {
  return [{ title: '角色 · 云眼运营后台' }]
}

export async function clientLoader(_args: Route.ClientLoaderArgs) {
  requireAdminPermissions(['admin:roles:read'])
  return null
}

export default function RolesRoute() {
  return <RolesAdminPage />
}
