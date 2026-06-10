import { redirect } from 'react-router'

import { auth } from '~/shared/auth/client'
import { hasAnyPermissionCodes } from '~/shared/auth/admin-access'

export function requireAdminPermissions(codes: string[]) {
  auth.hydrateSession()
  const permissions = auth.getSession()?.user.permissions ?? []
  if (!hasAnyPermissionCodes(permissions, codes)) {
    throw redirect('/403')
  }
}
