import { redirect } from 'react-router'

import { TenantCustomRolesPage } from '~/features/roles/ui/tenant-custom-roles-page'
import { canAccessAdminMembers, resolveMembersTenantId } from '~/shared/auth/admin-access'
import { auth } from '~/shared/auth/client'

import type { Route } from './+types/tenant-roles'

export function meta(_args: Route.MetaArgs) {
  return [{ title: '自定义角色 · 云眼运营后台' }]
}

export async function clientLoader({ request }: Route.ClientLoaderArgs) {
  auth.hydrateSession()
  const session = auth.getSession()
  if (!canAccessAdminMembers(session)) {
    throw redirect('/403')
  }

  const tenantId = resolveMembersTenantId(
    session,
    new URL(request.url).searchParams.get('tenantId'),
  )
  if (!tenantId) {
    throw redirect('/403')
  }
  return { tenantId }
}

export default function TenantRolesRoute({ loaderData }: Route.ComponentProps) {
  return <TenantCustomRolesPage tenantId={loaderData.tenantId} />
}
