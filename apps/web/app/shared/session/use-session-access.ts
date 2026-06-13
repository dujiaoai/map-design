import { PermissionCodes, useSession } from '@repo/auth'

import { useWorkspaceSession } from '~/shared/session/use-workspace-session'

import {
  sessionCanReadMap,
  sessionCanWriteMap,
  sessionHasAnyPermission,
  sessionHasPermission,
  sessionHasSaasRole,
  sessionIsTenantOrPlatformAdmin,
  sessionPermissionCodes,
} from './session-access'

export function useSessionPermissions() {
  const { session } = useWorkspaceSession()
  return sessionPermissionCodes(session)
}

export function useHasPermission(required: string): boolean {
  const { session } = useWorkspaceSession()
  return sessionHasPermission(session, required)
}

export function useHasAnyPermission(required: readonly string[]): boolean {
  const { session } = useWorkspaceSession()
  return sessionHasAnyPermission(session, required)
}

export function useHasSaasRole(role: Parameters<typeof sessionHasSaasRole>[1]): boolean {
  const { session } = useWorkspaceSession()
  return sessionHasSaasRole(session, role)
}

export function useIsTenantOrPlatformAdmin(): boolean {
  const { session } = useWorkspaceSession()
  return sessionIsTenantOrPlatformAdmin(session)
}

export function useCanAccessWorkspace(): boolean {
  const { session } = useWorkspaceSession()
  return sessionHasPermission(session, PermissionCodes.WORKSPACE_USE)
}

export function useCanWriteMap(): boolean {
  const { session } = useWorkspaceSession()
  return sessionCanWriteMap(session)
}

export function useCanReadMap(): boolean {
  const { session } = useWorkspaceSession()
  return sessionCanReadMap(session)
}

/** @deprecated 请用 `useWorkspaceSession` + `useSessionPermissions` */
export function useLegacySessionProfile() {
  const { session, isLoading, error } = useWorkspaceSession()
  const contextSession = useSession()

  return {
    session: session ?? contextSession,
    roles: session?.user.roles ?? [],
    permissions: sessionPermissionCodes(session),
    hydrated: Boolean(session) || !isLoading,
    isLoading,
    error,
  }
}
