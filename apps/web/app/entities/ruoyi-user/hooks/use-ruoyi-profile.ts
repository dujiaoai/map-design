import {
  useCanAccessWorkspace,
  useCanReadMap,
  useCanWriteMap,
  useHasAnyPermission,
  useHasPermission,
  useHasSaasRole,
  useIsTenantOrPlatformAdmin,
  useLegacySessionProfile,
  useSessionPermissions,
} from '~/shared/session/use-session-access'

export {
  useCanAccessWorkspace,
  useCanReadMap,
  useCanWriteMap,
  useHasAnyPermission,
  useHasPermission,
  useHasSaasRole,
  useIsTenantOrPlatformAdmin,
  useSessionPermissions,
}

/** @deprecated 请用 `useSessionPermissions` */
export { useLegacySessionProfile as useRuoYiProfile } from '~/shared/session/use-session-access'

/** @deprecated 请用 `useSessionPermissions` */
export function useRuoYiPermissions() {
  return useLegacySessionProfile().permissions
}

/** @deprecated 请用 `useHasSaasRole` 或 `useIsTenantOrPlatformAdmin` */
export function useIsRuoYiAdmin(): boolean {
  return useIsTenantOrPlatformAdmin()
}

/** @deprecated RuoYi role key；请用 `useHasSaasRole` */
export function useHasRoleKey(roleKey: string): boolean {
  const { roles } = useLegacySessionProfile()
  return roles.includes(roleKey)
}
