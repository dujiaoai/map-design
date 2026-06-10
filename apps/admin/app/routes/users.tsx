import { UsersAdminPage } from '~/features/users/ui/users-admin-page'
import { requireAdminPermissions } from '~/shared/auth/require-admin-permissions'

import type { Route } from './+types/users'

export function meta(_args: Route.MetaArgs) {
  return [{ title: '用户 · 云眼运营后台' }]
}

export async function clientLoader(_args: Route.ClientLoaderArgs) {
  requireAdminPermissions(['admin:users:read'])
  return null
}

export default function UsersRoute() {
  return <UsersAdminPage />
}
