import { adminNavItems } from './nav-items'
import { isAdminNavActive } from './build-admin-nav-sections'

export function resolveAdminPageTitle(pathname: string): string {
  if (pathname === '/account') return '账号信息'

  const matched = adminNavItems.find((item) => isAdminNavActive(pathname, item.to))
  return matched?.label ?? '运营控制台'
}
