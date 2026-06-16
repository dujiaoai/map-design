import type { AdminPermission } from '~/shared/api/admin-api'

export type RolePermissionTransferItem = {
  key: string
  title: string
  description: string
}

export function permissionsToTransferItems(
  permissions: AdminPermission[],
): RolePermissionTransferItem[] {
  return permissions.map((permission) => ({
    key: permission.code,
    title: permission.name,
    description: permission.code,
  }))
}

export function filterTransferItemsByQuery(
  items: RolePermissionTransferItem[],
  query: string,
): RolePermissionTransferItem[] {
  const normalized = query.trim().toLowerCase()
  if (!normalized) return items
  return items.filter(
    (item) =>
      item.key.toLowerCase().includes(normalized) ||
      item.title.toLowerCase().includes(normalized),
  )
}
