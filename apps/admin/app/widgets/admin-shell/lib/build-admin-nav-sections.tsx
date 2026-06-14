import type { NavMapSectionUi } from '@repo/ui'
import { createElement } from 'react'

import type { Session } from '@repo/auth'

import { hasAnyPermissionCodes, isPlatformAdmin } from '~/shared/auth/admin-access'

import { adminNavItems, type AdminNavItem } from './nav-items'

export const ADMIN_NAV_SECTION_DEFS = [
  { id: 'platform', label: '平台', routes: ['/', '/tenants', '/users'] },
  { id: 'collaboration', label: '协作', routes: ['/members', '/roles'] },
  { id: 'operations', label: '运维', routes: ['/audit-logs', '/billing', '/system'] },
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
  return false
}

export function buildAdminNavSections(
  pathname: string,
  session: Session | null,
): NavMapSectionUi[] {
  return ADMIN_NAV_SECTION_DEFS.map((def) => ({
    id: def.id,
    label: def.label,
    items: def.routes
      .map((route) => adminNavItems.find((item) => item.to === route))
      .filter((item): item is AdminNavItem => Boolean(item && canSeeAdminNavItem(item, session)))
      .map((item) => toNavMainItem(item, pathname)),
  })).filter((section) => section.items.length > 0)
}
