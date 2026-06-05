import type { NavItem } from './build-nav-tree'

export interface NavMainItem {
  title: string
  url: string
  external?: boolean
  items?: NavMainSubItem[]
}

export interface NavMainSubItem {
  title: string
  url: string
  external?: boolean
}

function mapSubItems(items: NavItem[]): NavMainSubItem[] {
  const result: NavMainSubItem[] = []

  for (const item of items) {
    if (item.children?.length) {
      result.push(...mapSubItems(item.children))
      continue
    }
    if (item.href === '#') continue
    result.push({
      title: item.title,
      url: item.href,
      external: item.external,
    })
  }

  return result
}

/** 将 RuoYi 菜单树转为 shadcn NavMain 数据结构 */
export function toNavMainItems(items: NavItem[]): NavMainItem[] {
  return items.flatMap((item) => {
    if (item.children?.length) {
      const subItems = mapSubItems(item.children)
      if (subItems.length === 0) return []
      return [
        {
          title: item.title,
          url: item.href === '#' ? subItems[0]?.url ?? '#' : item.href,
          external: item.external,
          items: subItems,
        },
      ]
    }

    if (item.href === '#') return []
    return [
      {
        title: item.title,
        url: item.href,
        external: item.external,
      },
    ]
  })
}
