import type { NavMainItem, NavMainSubItem } from '../model/types'

/** 分组下的可点击叶子（无 items 时视为自身即叶子） */
export function getNavGroupLeaves(group: NavMainItem): NavMainSubItem[] {
  if (group.items?.length) {
    return group.items
  }
  if (!group.kind) {
    return []
  }
  return [
    {
      id: group.id,
      title: group.title,
      kind: group.kind,
      toolId: group.toolId,
      moduleId: group.moduleId,
      url: group.url,
      href: group.href,
    },
  ]
}

export function findNavLeafById(items: NavMainItem[], id: string): NavMainSubItem | undefined {
  for (const group of items) {
    const match = getNavGroupLeaves(group).find((leaf) => leaf.id === id)
    if (match) {
      return match
    }
  }
  return undefined
}

export function findNavLeaf(
  items: NavMainItem[],
  predicate: (item: NavMainSubItem) => boolean,
): NavMainSubItem | undefined {
  for (const group of items) {
    const match = getNavGroupLeaves(group).find(predicate)
    if (match) {
      return match
    }
  }
  return undefined
}
