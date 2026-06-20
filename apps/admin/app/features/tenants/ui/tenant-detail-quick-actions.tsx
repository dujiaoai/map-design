import { Button, cn } from '@repo/ui'
import type { LucideIcon } from 'lucide-react'
import {
  CreditCardIcon,
  ScrollTextIcon,
  UserCogIcon,
  UsersIcon,
} from 'lucide-react'
import { Link } from 'react-router'

import { buildAuditLogsLink } from '~/features/audit-logs/lib/audit-log-nav'

type QuickAction = {
  key: string
  label: string
  description: string
  icon: LucideIcon
  render?: React.ReactElement
  onClick?: () => void
}

function QuickActionCard({ action }: { action: QuickAction }) {
  const Icon = action.icon

  return (
    <Button
      type="button"
      variant="outline"
      nativeButton={action.render ? false : undefined}
      render={action.render}
      onClick={action.onClick}
      className={cn(
        'admin-create-plan-chip h-auto w-full flex-col items-start gap-2 rounded-xl border px-3 py-3 text-left whitespace-normal',
        'hover:border-primary/35 hover:bg-primary/8',
      )}
    >
      <span className="flex w-full items-center gap-2">
        <Icon className="size-4 shrink-0 text-primary" aria-hidden />
        <span className="text-sm font-medium">{action.label}</span>
      </span>
      <span className="text-[11px] leading-relaxed font-normal text-muted-foreground">
        {action.description}
      </span>
    </Button>
  )
}

export function TenantDetailQuickActions({
  tenantId,
  canReadMembers,
  canReadUsers,
  canViewBilling,
  canViewAudit,
  canImpersonate,
  onOpenMembers,
  onImpersonate,
}: {
  tenantId: string
  canReadMembers: boolean
  canReadUsers: boolean
  canViewBilling: boolean
  canViewAudit: boolean
  canImpersonate: boolean
  onOpenMembers: () => void
  onImpersonate: () => void
}) {
  const actions: QuickAction[] = []

  if (canReadMembers) {
    actions.push({
      key: 'members',
      label: '成员管理',
      description: '邀请成员、分配角色与查看席位占用',
      icon: UsersIcon,
      onClick: onOpenMembers,
    })
  }

  if (canReadUsers) {
    actions.push({
      key: 'users',
      label: '用户列表',
      description: '跨租户视角查看本租户关联用户',
      icon: UsersIcon,
      render: <Link to={`/users?tenantId=${tenantId}`} />,
    })
  }

  if (canViewBilling) {
    actions.push({
      key: 'billing',
      label: '计费钱包',
      description: '查看余额、充值记录与调账流水',
      icon: CreditCardIcon,
      render: (
        <Link to={`/billing?tab=wallets&tenantId=${encodeURIComponent(tenantId)}`} />
      ),
    })
  }

  if (canViewAudit) {
    actions.push({
      key: 'audit',
      label: '审计日志',
      description: '筛选本租户相关操作与跨租户记录',
      icon: ScrollTextIcon,
      render: <Link to={buildAuditLogsLink({ tenantId })} />,
    })
  }

  if (canImpersonate) {
    actions.push({
      key: 'impersonate',
      label: '代操作',
      description: '以租户管理员身份进入业务端排查问题',
      icon: UserCogIcon,
      onClick: onImpersonate,
    })
  }

  if (actions.length === 0) return null

  return (
    <section className="space-y-3">
      <div>
        <h2 className="admin-display text-xs tracking-[0.18em] text-muted-foreground uppercase">
          快捷入口
        </h2>
        <p className="mt-1 text-sm text-muted-foreground">
          常用运营动作，也可通过顶部 Tab 进入对应模块。
        </p>
      </div>
      <div className="grid gap-2 sm:grid-cols-2 lg:grid-cols-3">
        {actions.map((action) => (
          <QuickActionCard key={action.key} action={action} />
        ))}
      </div>
    </section>
  )
}
