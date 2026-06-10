import { redirect } from 'react-router'

import { MembersAdminPage } from '~/features/members/ui/members-admin-page'
import { auth } from '~/shared/auth/client'
import { requireAdminPermissions } from '~/shared/auth/require-admin-permissions'

import type { Route } from './+types/members'

export function meta(_args: Route.MetaArgs) {
  return [{ title: '成员 · 云眼运营后台' }]
}

export async function clientLoader(_args: Route.ClientLoaderArgs) {
  requireAdminPermissions(['admin:members:read'])
  auth.hydrateSession()
  const tenantId = auth.getSession()?.tenant?.id
  if (!tenantId) {
    throw redirect('/403')
  }
  return { tenantId }
}

export default function MembersRoute({ loaderData }: Route.ComponentProps) {
  return <MembersAdminPage tenantId={loaderData.tenantId} />
}
