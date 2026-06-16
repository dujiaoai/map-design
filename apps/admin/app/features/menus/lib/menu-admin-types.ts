export const TOOLS_SECTION_ID = '__tools__'

export function toMenuItemUpdate(item: {
  id: string
  title: string
  sortOrder: number
  enabled: boolean
}) {
  return {
    id: item.id,
    title: item.title,
    sortOrder: item.sortOrder,
    enabled: item.enabled,
  }
}

export function normalizeItemSortOrders<T extends { sortOrder: number }>(items: T[]): T[] {
  return items.map((item, index) => ({ ...item, sortOrder: index }))
}

export function moveItemAtIndex<T>(items: T[], fromIndex: number, toIndex: number): T[] {
  if (fromIndex === toIndex || fromIndex < 0 || toIndex < 0 || fromIndex >= items.length) {
    return items
  }
  const next = [...items]
  const [moved] = next.splice(fromIndex, 1)
  if (!moved) return items
  next.splice(toIndex, 0, moved)
  return next
}

export type { AdminMenuItem, AdminMenuSection } from './menus-admin-api'
