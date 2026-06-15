import type { LucideIcon } from 'lucide-react'
import {
  Building2Icon,
  CreditCardIcon,
  ScrollTextIcon,
  ShieldCheckIcon,
  SlidersHorizontalIcon,
  UsersIcon,
} from 'lucide-react'
import { Link } from 'react-router'

import { useAdminPermissions } from '~/shared/hooks/use-admin-permissions'
import { AdminPanel, AdminPanelHeader } from '~/shared/ui/admin-page-shell'

const QUICK_LINKS: {
  to: string
  label: string
  description: string
  icon: LucideIcon
  permissions: string[]
}[] = [
  {
    to: '/tenants',
    label: '租户',
    description: '创建、编辑与能力配置',
    icon: Building2Icon,
    permissions: ['admin:tenants:read'],
  },
  {
    to: '/users',
    label: '用户',
    description: '邀请与跨租户筛选',
    icon: UsersIcon,
    permissions: ['admin:users:read'],
  },
  {
    to: '/roles',
    label: '系统角色',
    description: '平台级 RBAC 权限',
    icon: ShieldCheckIcon,
    permissions: ['admin:roles:read'],
  },
  {
    to: '/audit-logs',
    label: '审计',
    description: '成员与计费操作记录',
    icon: ScrollTextIcon,
    permissions: ['admin:tenants:read'],
  },
  {
    to: '/billing',
    label: '计费',
    description: '钱包、SKU 与调账',
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
    description: '运行配置与健康摘要',
    icon: SlidersHorizontalIcon,
    permissions: ['admin:tenants:read'],
  },
]

export function AdminQuickNav() {
  const { canAny } = useAdminPermissions()
  const links = QUICK_LINKS.filter((item) => canAny(item.permissions))
  if (links.length === 0) return null

  return (
    <AdminPanel>
      <AdminPanelHeader title="快捷入口" description="常用运维页面" />
      <div className="grid gap-3 p-4 sm:grid-cols-2 lg:grid-cols-3 md:p-5">
        {links.map(({ to, label, description, icon: Icon }) => (
          <Link
            key={to}
            to={to}
            className="admin-quick-link group flex items-start gap-3 rounded-xl border border-border/60 bg-muted/10 px-4 py-3"
          >
            <span className="flex size-9 shrink-0 items-center justify-center rounded-lg border border-primary/20 bg-primary/10 text-primary transition-colors group-hover:bg-primary/15">
              <Icon className="size-4" aria-hidden />
            </span>
            <span className="min-w-0">
              <span className="block text-sm font-medium">{label}</span>
              <span className="mt-0.5 block text-xs text-muted-foreground">{description}</span>
            </span>
          </Link>
        ))}
      </div>
    </AdminPanel>
  )
}
