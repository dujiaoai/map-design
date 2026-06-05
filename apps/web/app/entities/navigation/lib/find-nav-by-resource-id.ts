import type { MapToolVariantKey, NavMainItem, NavMainSubItem } from '../model/types'
import { mockNavToolMetaByItemId } from '../model/mock-nav-items'

import { findNavLeaf, getNavGroupLeaves } from './nav-leaves'

/** 按 toolId 查找 map-tool 菜单项（多个匹配时返回第一个） */
export function findNavSubItemByToolId(
  items: NavMainItem[],
  toolId: string,
): NavMainSubItem | undefined {
  return findNavLeaf(items, (item) => item.kind === 'map-tool' && item.toolId === toolId)
}

/** 按 toolId + URL variant 解析唯一菜单项 */
export function findNavSubItemByToolRef(
  items: NavMainItem[],
  toolId: string,
  variant: MapToolVariantKey | null,
): NavMainSubItem | undefined {
  const matches = items
    .flatMap(getNavGroupLeaves)
    .filter((item) => item.kind === 'map-tool' && item.toolId === toolId)

  if (matches.length === 0) {
    return undefined
  }

  if (variant) {
    return (
      matches.find((item) => mockNavToolMetaByItemId[item.id]?.variantKey === variant) ??
      undefined
    )
  }

  return (
    matches.find((item) => mockNavToolMetaByItemId[item.id]?.variantKey === undefined) ??
    matches[0]
  )
}

/** 按 moduleId 查找 map-module（地图业务）菜单项 */
export function findNavSubItemByModuleId(
  items: NavMainItem[],
  moduleId: string,
): NavMainSubItem | undefined {
  return findNavLeaf(items, (item) => item.kind === 'map-module' && item.moduleId === moduleId)
}

/** 按 moduleId 查找 map-dock-module（机库）菜单项 */
export function findNavSubItemByDockModuleId(
  items: NavMainItem[],
  moduleId: string,
): NavMainSubItem | undefined {
  return findNavLeaf(
    items,
    (item) => item.kind === 'map-dock-module' && item.moduleId === moduleId,
  )
}
