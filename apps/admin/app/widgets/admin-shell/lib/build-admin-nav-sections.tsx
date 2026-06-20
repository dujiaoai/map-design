import type { NavMapSectionUi } from '@repo/ui'
import { createElement } from 'react'

import type { Session } from '@repo/auth'

import { hasAnyPermissionCodes, isPlatformAdmin } from '~/shared/auth/admin-access'

import { filterNavItemsForProduct } from '~/shared/lib/admin-module-registry'

import { adminNavItems, type AdminNavItem } from './nav-items'

export const ADMIN_NAV_SECTION_DEFS = [
  { id: 'platform', label: '平台', routes: ['/', '/tenants', '/users'] },
  { id: 'collaboration', label: '协作', routes: ['/members', '/tenant-roles', '/roles', '/permissions'] },
  { id: 'operations', label: '运维', routes: ['/audit-logs', '/menus', '/billing', '/system'] },
] as const

export function isAdminNavActive(pathname: string, to: string): boolean {
  if (to === '/') return pathname === '/'
  return pathname === to || pathname.startsWith(`${to}/`)
}

function toNavMainItem(item: AdminNavItem, pathname: string) {
  return {
    id: item.to,
    title: item.label,
    icon: createElement(item.icon, { className: 'size-4' }),
    isActive: isAdminNavActive(pathname, item.to),
  }
}

function canSeeAdminNavItem(item: AdminNavItem, session: Session | null): boolean {
  if (item.to === '/account') return false
  if (item.permissions.length === 0) return true
  if (hasAnyPermissionCodes(session?.user.permissions ?? [], item.permissions)) return true
  if (item.to === '/members' && isPlatformAdmin(session)) return true
  if (item.to === '/tenant-roles' && isPlatformAdmin(session)) return true
  return false
}

export function buildAdminNavSections(
  pathname: string,
  session: Session | null,
  productCode?: string | null,
): NavMapSectionUi[] {
  const visibleItems = filterNavItemsForProduct(adminNavItems, productCode)
  return ADMIN_NAV_SECTION_DEFS.map((def) => ({
    id: def.id,
    label: def.label,
    items: def.routes
      .map((route) => visibleItems.find((item) => item.to === route))
      .filter((item): item is AdminNavItem => Boolean(item && canSeeAdminNavItem(item, session)))
      .map((item) => toNavMainItem(item, pathname)),
  })).filter((section) => section.items.length > 0)
}
