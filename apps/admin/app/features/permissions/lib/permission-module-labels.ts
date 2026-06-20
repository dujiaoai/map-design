import { PERMISSION_SCOPE_LABELS } from '~/features/roles/lib/role-permission-rules'
import type { AdminPermissionModule } from '~/shared/api/admin-api'

export { PERMISSION_SCOPE_LABELS }

export function moduleInitials(module: Pick<AdminPermissionModule, 'code' | 'name'>): string {
  const name = module.name.trim()
  if (name.length >= 2) return name.slice(0, 2)
  return module.code.slice(0, 2).toUpperCase()
}

export function describePermissionModule(module: AdminPermissionModule): string {
  if (module.description?.trim()) return module.description.trim()
  if (module.system) {
    return `系统内置${PERMISSION_SCOPE_LABELS[module.scope]}权限模块；权限项由迁移脚本维护，不可增删。`
  }
  return `自定义${PERMISSION_SCOPE_LABELS[module.scope]}权限模块；可在此添加权限项并分配给角色。`
}
