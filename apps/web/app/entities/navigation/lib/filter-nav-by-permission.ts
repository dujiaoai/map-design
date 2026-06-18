import type { MenuItemDto } from '~/shared/api/menus'

/** 按会话权限过滤 API 菜单项（与 saas-api permissionCode 门控对齐） */
export function filterMenuItemsByPermission(
  items: MenuItemDto[],
  permissionCodes: readonly string[],
): MenuItemDto[] {
  const granted = new Set(permissionCodes)
  return items.filter((item) => {
    const code = item.permissionCode?.trim()
    if (!code) return true
    return granted.has(code)
  })
}

export function filterMenuSectionsByPermission<
  T extends { items: MenuItemDto[] },
>(sections: T[], permissionCodes: readonly string[]): T[] {
  return sections
    .map((section) => ({
      ...section,
      items: filterMenuItemsByPermission(section.items, permissionCodes),
    }))
    .filter((section) => section.items.length > 0)
}
