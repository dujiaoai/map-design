import type { LucideIcon } from 'lucide-react'
import {
  Building2Icon,
  LayoutDashboardIcon,
  SettingsIcon,
  ShieldIcon,
  UserRoundCogIcon,
  UsersIcon,
} from 'lucide-react'

export interface AdminNavItem {
  to: string
  label: string
  icon: LucideIcon
  /** 任一权限码满足即显示 */
  permissions: string[]
}

export const adminNavItems: AdminNavItem[] = [
  {
    to: '/',
    label: '概览',
    icon: LayoutDashboardIcon,
    permissions: ['admin:tenants:read', 'admin:users:read', 'admin:roles:read'],
  },
  {
    to: '/tenants',
    label: '租户',
    icon: Building2Icon,
    permissions: ['admin:tenants:read'],
  },
  {
    to: '/users',
    label: '用户',
    icon: UsersIcon,
    permissions: ['admin:users:read'],
  },
  {
    to: '/members',
    label: '成员',
    icon: UserRoundCogIcon,
    permissions: ['admin:members:read'],
  },
  {
    to: '/roles',
    label: '角色',
    icon: ShieldIcon,
    permissions: ['admin:roles:read'],
  },
  {
    to: '/account',
    label: '账号',
    icon: SettingsIcon,
    permissions: [],
  },
]
