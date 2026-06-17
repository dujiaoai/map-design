import { redirect } from 'react-router'

import { hasAnyPermissionCodes, isPlatformAdmin } from '~/shared/auth/admin-access'
import { auth } from '~/shared/auth/client'

export function requireAdminPermissions(codes: string[]) {
  auth.hydrateSession()
  const session = auth.getSession()
  if (isPlatformAdmin(session)) return
  const permissions = session?.user.permissions ?? []
  if (!hasAnyPermissionCodes(permissions, codes)) {
    throw redirect('/403')
  }
}
