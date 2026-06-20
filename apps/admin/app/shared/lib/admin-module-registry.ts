import type { AdminNavItem } from '~/widgets/admin-shell/lib/nav-items'

export interface AdminModuleDefinition {
  id: string
  /** 空表示全产品可见 */
  productCodes?: string[]
  navItems: AdminNavItem[]
}

const CORE_PLATFORM_MODULE: AdminModuleDefinition = {
  id: 'core-platform',
  navItems: [],
}

/** 注册表占位：nav-items 仍为主数据源，模块可按 productCodes 过滤扩展项。 */
export function registerAdminModule(module: AdminModuleDefinition) {
  return module
}

export function filterNavItemsForProduct(
  items: AdminNavItem[],
  productCode: string | null | undefined,
  extraModules: AdminModuleDefinition[] = [],
): AdminNavItem[] {
  const extras = extraModules.flatMap((module) => {
    if (module.productCodes?.length && productCode && !module.productCodes.includes(productCode)) {
      return []
    }
    return module.navItems
  })
  const merged = [...items, ...extras]
  const seen = new Set<string>()
  return merged.filter((item) => {
    if (seen.has(item.to)) return false
    seen.add(item.to)
    return true
  })
}

export { CORE_PLATFORM_MODULE }
