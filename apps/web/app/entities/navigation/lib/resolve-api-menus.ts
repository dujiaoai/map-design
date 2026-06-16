import type { MenuItemDto, MenuSectionDto } from '~/shared/api/menus'

import { resolveNavIcon } from './nav-icon-registry'
import type { NavMainItem, NavMainItemKind, NavMapSectionDef } from '../model/types'

function toNavMainItem(dto: MenuItemDto): NavMainItem {
  return {
    id: dto.id,
    title: dto.title,
    icon: resolveNavIcon(dto.icon),
    kind: dto.kind as NavMainItemKind,
    toolId: dto.toolId ?? undefined,
    moduleId: dto.moduleId ?? undefined,
    url: dto.url ?? undefined,
    href: dto.href ?? undefined,
  }
}

export function resolveNavMainItemsFromApi(items: MenuItemDto[]): NavMainItem[] {
  return items.map(toNavMainItem)
}

export function resolveNavSectionDefsFromApi(sections: MenuSectionDto[]): NavMapSectionDef[] {
  return sections.map((section) => ({
    id: section.id,
    label: section.label,
    collapsible: section.collapsible,
    defaultOpen: section.defaultOpen,
    storageKey: section.storageKey ?? undefined,
    items: section.items.map(toNavMainItem),
  }))
}
