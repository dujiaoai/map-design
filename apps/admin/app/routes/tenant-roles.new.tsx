import { redirect } from 'react-router'

import { CreateTenantRolePage } from '~/features/roles/ui/create-tenant-role-page'
import {
  canAccessAdminMembers,
  canWriteAdminMembers,
  resolveMembersTenantId,
} from '~/shared/auth/admin-access'
import { auth } from '~/shared/auth/client'

import type { Route } from './+types/tenant-roles.new'

export function meta(_args: Route.MetaArgs) {
  return [{ title: '新建自定义角色 · 云眼运营后台' }]
}

export async function clientLoader({ request }: Route.ClientLoaderArgs) {
  auth.hydrateSession()
  const session = auth.getSession()
  if (!canAccessAdminMembers(session)) {
    throw redirect('/403')
  }
  if (!canWriteAdminMembers(session)) {
    throw redirect('/403')
  }

  const url = new URL(request.url)
  const tenantId = resolveMembersTenantId(session, url.searchParams.get('tenantId'))
  if (!tenantId) {
    throw redirect('/403')
  }

  return {
    tenantId,
    from: url.searchParams.get('from'),
  }
}

export default function CreateTenantRoleRoute({ loaderData }: Route.ComponentProps) {
  return (
    <CreateTenantRolePage tenantId={loaderData.tenantId} from={loaderData.from} />
  )
}
