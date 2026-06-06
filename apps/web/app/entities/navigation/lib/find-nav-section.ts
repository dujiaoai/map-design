import { mockNavMapSectionDefs } from '../model/mock-nav-items'

/** 按菜单 id 查找所属侧栏段标题（如「数据」「机库」） */
export function findNavSectionLabelByNavItemId(navItemId: string): string | null {
  for (const section of mockNavMapSectionDefs) {
    const matched = section.items.some(
      (item) =>
        item.id === navItemId || item.items?.some((subItem) => subItem.id === navItemId),
    )
    if (matched) {
      return section.label
    }
  }
  return null
}
