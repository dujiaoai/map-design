import { useUserInfoQuery } from '~/shared/queries'

import { hasAnyPermission, hasPermission, hasRoleKey, isAdmin } from '../lib/permissions'
import { useRuoYiProfileStore } from '../model/ruoyi-profile-store'

export function useRuoYiProfile() {
  const store = useRuoYiProfileStore()
  const query = useUserInfoQuery()

  return {
    user: store.user ?? query.data?.user ?? null,
    roles: store.roles.length > 0 ? store.roles : (query.data?.roles ?? []),
    permissions:
      store.permissions.length > 0 ? store.permissions : (query.data?.permissions ?? []),
    hydrated: store.hydrated || query.isSuccess,
    isLoading: query.isPending && !store.hydrated,
    error: query.error,
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
  return hasRoleKey(roles, roleKey)
}

export function useIsRuoYiAdmin(): boolean {
  const { roles } = useRuoYiProfile()
  return isAdmin(roles)
}
