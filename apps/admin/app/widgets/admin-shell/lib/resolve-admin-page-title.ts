import { adminNavItems } from './nav-items'
import { isAdminNavActive } from './build-admin-nav-sections'

const TENANT_DETAIL_PATH = /^\/tenants\/[^/]+$/

export function resolveAdminPageTitle(pathname: string): string {
  if (pathname === '/account') return '账号信息'
  if (TENANT_DETAIL_PATH.test(pathname)) return '租户详情'

  const matched = adminNavItems.find((item) => isAdminNavActive(pathname, item.to))
  return matched?.label ?? '运营控制台'
}
