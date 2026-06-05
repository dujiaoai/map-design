import type { NavMainUiItem } from '@haoxuan/ui'

import type { NavMainItem } from '../model/types'
import { getNavGroupLeaves } from './nav-leaves'

/** 将业务 NavMainItem 转为 UI 包 NavMain 数据结构 */
export function toNavMainUiItems(items: NavMainItem[], activeNavItemIds: string[]): NavMainUiItem[] {
  const activeSet = new Set(activeNavItemIds)

  return items.map((group) => {
    const leaves = getNavGroupLeaves(group)
    const isLeaf = leaves.length === 1 && !group.items?.length

    return {
      id: group.id,
      title: group.title,
      icon: group.icon,
      isActive: leaves.some((leaf) => activeSet.has(leaf.id)),
      items: isLeaf
        ? undefined
        : leaves.map((sub) => ({
            id: sub.id,
            title: sub.title,
            isActive: activeSet.has(sub.id),
          })),
    }
  })
}
