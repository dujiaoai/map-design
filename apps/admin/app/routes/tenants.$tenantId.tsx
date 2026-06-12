import { redirect } from 'react-router'

import { TenantDetailPage } from '~/features/tenants/ui/tenant-detail-page'
import { requireAdminPermissions } from '~/shared/auth/require-admin-permissions'

import type { Route } from './+types/tenants.$tenantId'

export function meta(_args: Route.MetaArgs) {
  return [{ title: '租户详情 · 云眼运营后台' }]
}

export async function clientLoader({ params }: Route.ClientLoaderArgs) {
  requireAdminPermissions(['admin:tenants:read'])
  const tenantId = params.tenantId?.trim()
  if (!tenantId) {
    throw redirect('/tenants')
  }
  return { tenantId }
}

export default function TenantDetailRoute({ loaderData }: Route.ComponentProps) {
  return <TenantDetailPage tenantId={loaderData.tenantId} />
}
