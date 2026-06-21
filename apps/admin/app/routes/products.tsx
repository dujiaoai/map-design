import { ProductsAdminPage } from '~/features/products/ui/products-admin-page'
import { requireAdminPermissions } from '~/shared/auth/require-admin-permissions'

import type { Route } from './+types/products'

export function meta(_args: Route.MetaArgs) {
  return [{ title: '产品线 · 云眼运营后台' }]
}

export async function clientLoader(_args: Route.ClientLoaderArgs) {
  requireAdminPermissions(['admin:tenants:read'])
  return null
}

export default function ProductsRoute() {
  return <ProductsAdminPage />
}
