import { SaaSRole } from '@repo/auth'

import { hasAnyPermission, hasPermission } from '../lib/permissions'
import {
  sessionHasSaasRole,
  sessionIsTenantOrPlatformAdmin,
  sessionPermissionCodes,
} from '~/shared/session/session-access'
import { useWorkspaceSession } from '~/shared/session/use-workspace-session'

/** @deprecated 命名保留至 Sprint D；请优先 `useWorkspaceSession` + `sessionPermissionCodes` */
export function useRuoYiProfile() {
  const { session, isLoading, error } = useWorkspaceSession()
  const permissions = sessionPermissionCodes(session)

  return {
    session,
    roles: session?.user.roles ?? [],
    permissions,
    hydrated: Boolean(session) || !isLoading,
    isLoading,
    error,
  }
}

export function useRuoYiPermissions() {
  return useRuoYiProfile().permissions
}

export function useHasPermission(required: string): boolean {
  const permissions = useRuoYiPermissions()
  return hasPermission(permissions, required)
}

export function useHasAnyPermission(required: readonly string[]): boolean {
  const permissions = useRuoYiPermissions()
  return hasAnyPermission(permissions, required)
}

export function useHasRoleKey(roleKey: string): boolean {
  const { roles } = useRuoYiProfile()
  return roles.includes(roleKey)
}

export function useHasSaasRole(role: SaaSRole): boolean {
  const { session } = useRuoYiProfile()
  return sessionHasSaasRole(session, role)
}

/** @deprecated 请用 `useHasSaasRole` 或 `sessionIsTenantOrPlatformAdmin` */
export function useIsRuoYiAdmin(): boolean {
  const { session } = useRuoYiProfile()
  return sessionIsTenantOrPlatformAdmin(session)
}
