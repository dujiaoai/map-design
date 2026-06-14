import type { LucideIcon } from 'lucide-react'
import {
  Building2Icon,
  CreditCardIcon,
  KeyRoundIcon,
  LayoutDashboardIcon,
  ScrollTextIcon,
  SettingsIcon,
  ShieldCheckIcon,
  ShieldPlusIcon,
  SlidersHorizontalIcon,
  UsersIcon,
  UsersRoundIcon,
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
    icon: UsersRoundIcon,
    permissions: ['admin:members:read'],
  },
  {
    to: '/tenant-roles',
    label: '自定义角色',
    icon: ShieldPlusIcon,
    permissions: ['admin:members:read'],
  },
  {
    to: '/roles',
    label: '系统角色',
    icon: ShieldCheckIcon,
    permissions: ['admin:roles:read'],
  },
  {
    to: '/permissions',
    label: '权限目录',
    icon: KeyRoundIcon,
    permissions: ['admin:roles:read'],
  },
  {
    to: '/audit-logs',
    label: '审计',
    icon: ScrollTextIcon,
    permissions: ['admin:tenants:read'],
  },
  {
    to: '/billing',
    label: '计费',
    icon: CreditCardIcon,
    permissions: [
      'admin:billing:read',
      'admin:billing:adjust',
      'admin:billing:packages:write',
      'admin:billing:refund',
    ],
  },
  {
    to: '/system',
    label: '系统',
    icon: SlidersHorizontalIcon,
    permissions: ['admin:tenants:read'],
  },
  {
    to: '/account',
    label: '账号',
    icon: SettingsIcon,
    permissions: [],
  },
]
