import { redirect } from 'react-router'

import { PermissionCodes } from '@repo/auth'

import { auth } from '~/shared/auth/client'

/** clientLoader：要求已登录且具备工作台访问权限 */
export function requireWorkspaceAccess() {
  auth.hydrateSession()
  auth.requirePermission(auth.getSession(), PermissionCodes.WORKSPACE_USE, redirect)
}
