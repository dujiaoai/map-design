import { ROLE_DEFAULT_PERMISSIONS } from '../permission-codes'
import type { SaaSRole } from '../types'

/** 合并多角色默认权限（mock / 测试）；生产会话以 API 返回为准 */
export function resolvePermissionsForRoles(roles: readonly SaaSRole[]): string[] {
  const merged = new Set<string>()
  for (const role of roles) {
    const defaults = ROLE_DEFAULT_PERMISSIONS[role]
    if (defaults) {
      for (const code of defaults) merged.add(code)
    }
  }
  return [...merged]
}
