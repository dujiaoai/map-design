import { mockNavMapSectionDefs } from '../model/mock-nav-items'

/** 按菜单 id 查找所属侧栏段 id（如 data / uav / ops） */
export function findNavSectionIdByNavItemId(navItemId: string): string | null {
  for (const section of mockNavMapSectionDefs) {
    const matched = section.items.some(
      (item) =>
        item.id === navItemId || item.items?.some((subItem) => subItem.id === navItemId),
    )
    if (matched) {
      return section.id
    }
  }
  return null
}

export function isDataModuleNavItem(navItemId: string): boolean {
  return findNavSectionIdByNavItemId(navItemId) === 'data'
}
