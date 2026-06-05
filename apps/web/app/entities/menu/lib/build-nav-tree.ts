import type { MenuRoute } from '@repo/ruoyi-api'

export interface NavItem {
  id: string
  title: string
  href: string
  external?: boolean
  children?: NavItem[]
}

function routeId(route: MenuRoute, index: number): string {
  return route.name ?? `${route.path}-${index}`
}

function normalizePath(path: string): string {
  return path.replace(/\/{2,}/g, '/')
}

function resolveHref(route: MenuRoute, parentPath?: string): string {
  const link = route.meta?.link
  if (typeof link === 'string' && link.length > 0) return link

  const path = route.path ?? ''
  if (path.startsWith('http://') || path.startsWith('https://')) return path
  if (path.startsWith('/')) return normalizePath(path)
  if (parentPath && parentPath !== '/') {
    return normalizePath(`${parentPath}/${path}`)
  }
  return normalizePath(`/${path}`)
}

function isExternalHref(href: string): boolean {
  return href.startsWith('http://') || href.startsWith('https://')
}

function buildChildren(routes: MenuRoute[], parentPath?: string): NavItem[] {
  const items: NavItem[] = []

  routes.forEach((route, index) => {
    if (route.hidden) return

    const title = route.meta?.title?.trim()
    const childItems = route.children?.length ? buildChildren(route.children, resolveHref(route, parentPath)) : []

    if (!title && childItems.length === 0) return

    if (!title && childItems.length > 0) {
      items.push(...childItems)
      return
    }

    if (!title) return

    const href = resolveHref(route, parentPath)
    const external = isExternalHref(href)
    const isLayoutOnly = route.component === 'Layout' || route.component === 'ParentView'

    if (childItems.length > 0 && (route.alwaysShow || childItems.length > 1 || isLayoutOnly)) {
      items.push({
        id: routeId(route, index),
        title,
        href: external ? href : '#',
        external,
        children: childItems,
      })
      return
    }

    if (childItems.length === 1 && !route.alwaysShow && isLayoutOnly) {
      items.push(childItems[0]!)
      return
    }

    items.push({
      id: routeId(route, index),
      title,
      href,
      external,
      children: childItems.length > 0 ? childItems : undefined,
    })
  })

  return items
}

/** 将 RuoYi getRouters 树转为侧栏导航结构（过滤 hidden） */
export function buildNavTree(routes: MenuRoute[]): NavItem[] {
  return buildChildren(routes)
}

/** 统计可见叶子菜单数量 */
export function countNavLeaves(items: NavItem[]): number {
  return items.reduce((total, item) => {
    if (item.children?.length) return total + countNavLeaves(item.children)
    return total + 1
  }, 0)
}
