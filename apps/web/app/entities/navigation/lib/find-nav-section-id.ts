import { mockNavMapSectionDefs } from '../model/mock-nav-items'

const DATA_DOCK_SECTION_IDS = new Set(['layers', 'analysis'])

/** 按菜单 id 查找所属侧栏段 id（如 layers / analysis / ops） */
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

/** 图层 / 分析段模块走左侧「图层」Dock 槽位（URL 仍为 /data/:moduleId） */
export function isDataModuleNavItem(navItemId: string): boolean {
  const sectionId = findNavSectionIdByNavItemId(navItemId)
  return sectionId !== null && DATA_DOCK_SECTION_IDS.has(sectionId)
}
