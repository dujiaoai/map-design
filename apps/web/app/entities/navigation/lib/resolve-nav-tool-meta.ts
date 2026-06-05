import { mockNavToolMetaByItemId, mockToolMeta } from '../model/mock-nav-items'
import type { MapToolVariantKey, MockToolMeta, NavMainItem } from '../model/types'
import { findNavSubItem } from './find-nav-sub-item'
import { findNavSubItemByToolRef } from './find-nav-by-resource-id'

export function resolveNavToolMeta(
  items: NavMainItem[],
  navItemId: string,
): (MockToolMeta & { toolId: string }) | undefined {
  const preset = mockNavToolMetaByItemId[navItemId]
  if (preset) {
    return preset
  }

  const item = findNavSubItem(items, navItemId)
  if (!item?.toolId) {
    return undefined
  }

  const base = mockToolMeta[item.toolId]
  if (!base) {
    return undefined
  }

  return { toolId: item.toolId, ...base }
}

export function resolveNavToolMetaFromUrl(
  items: NavMainItem[],
  toolId: string,
  variant: MapToolVariantKey | null,
): { navItem: { id: string; toolId: string }; meta: MockToolMeta & { toolId: string } } | undefined {
  const navItem = findNavSubItemByToolRef(items, toolId, variant)
  if (!navItem?.toolId) {
    return undefined
  }

  const meta = resolveNavToolMeta(items, navItem.id)
  if (!meta) {
    return undefined
  }

  return { navItem: { id: navItem.id, toolId: navItem.toolId }, meta }
}
