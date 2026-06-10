/** @deprecated Sprint D-09 后请从 `@repo/auth` 导入 `hasPermission` / `hasAnyPermission` */
export { hasAnyPermission, hasPermission } from '@repo/auth'

/** @deprecated RuoYi role key；SaaS 请用 `SaaSRole` + `sessionHasSaasRole` */
export function hasRoleKey(roles: readonly string[], roleKey: string): boolean {
  return roles.includes(roleKey)
}

/** @deprecated RuoYi admin 角色；SaaS 请用 `sessionIsTenantOrPlatformAdmin` */
export function isAdmin(roles: readonly string[]): boolean {
  return roles.includes('admin')
}
