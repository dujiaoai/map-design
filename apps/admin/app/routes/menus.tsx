import { MenusAdminPage } from '~/features/menus/ui/menus-admin-page'
import { requireAdminPermissions } from '~/shared/auth/require-admin-permissions'

import type { Route } from './+types/menus'

export function meta(_args: Route.MetaArgs) {
  return [{ title: '菜单配置 · 云眼运营后台' }]
}

export async function clientLoader(_args: Route.ClientLoaderArgs) {
  requireAdminPermissions(['admin:menus:read'])
  return null
}

export default function MenusRoute() {
  return <MenusAdminPage />
}
