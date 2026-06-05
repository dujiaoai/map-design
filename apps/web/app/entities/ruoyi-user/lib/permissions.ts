/** 判断单条 permission 是否匹配（支持 RuoYi 通配 *:*:*） */
export function matchPermission(granted: readonly string[], required: string): boolean {
  if (granted.includes('*:*:*')) return true
  if (granted.includes(required)) return true

  const [module, resource, action] = required.split(':')
  if (!module || !resource || !action) return false

  const patterns = [
    `${module}:${resource}:*`,
    `${module}:*:${action}`,
    `${module}:*:*`,
    `*:${resource}:${action}`,
    `*:*:${action}`,
    `*:${resource}:*`,
  ]

  return patterns.some((pattern) => granted.includes(pattern))
}

export function hasPermission(granted: readonly string[], required: string): boolean {
  return matchPermission(granted, required)
}

export function hasAnyPermission(granted: readonly string[], required: readonly string[]): boolean {
  return required.some((perm) => matchPermission(granted, perm))
}

export function hasRoleKey(roles: readonly string[], roleKey: string): boolean {
  return roles.includes(roleKey)
}

export function isAdmin(roles: readonly string[]): boolean {
  return roles.includes('admin')
}
