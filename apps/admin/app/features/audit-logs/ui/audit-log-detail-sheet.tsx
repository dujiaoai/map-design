import type { ReactNode } from 'react'
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
} from '@repo/ui'
import { Link } from 'react-router'

import { buildAuditBillingLink } from '~/features/audit-logs/lib/audit-log-billing-nav'
import { buildAuditUsersLink } from '~/features/audit-logs/lib/audit-log-users-nav'
import type { AdminAuditLogEntry } from '~/shared/api/admin-api'
import { AdminIdCell } from '~/shared/ui/admin-id-cell'
import { formatAdminDate } from '~/shared/ui/admin-status-badge'

export function AuditLogDetailSheet({
  log,
  open,
  onOpenChange,
  canReadTenants,
  canReadUsers,
}: {
  log: AdminAuditLogEntry | null
  open: boolean
  onOpenChange: (open: boolean) => void
  canReadTenants: boolean
  canReadUsers: boolean
}) {
  if (!log) return null

  const billingLink = buildAuditBillingLink(log.action, log.targetTenantId)
  const usersLink = canReadUsers ? buildAuditUsersLink(log.actorEmail, log.targetTenantId) : null

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent side="right" className="w-full sm:max-w-lg">
        <SheetHeader>
          <SheetTitle>审计详情</SheetTitle>
          <SheetDescription className="font-mono text-xs">{log.action}</SheetDescription>
        </SheetHeader>
        <dl className="mt-6 space-y-4 text-sm">
          <DetailRow label="时间" value={formatAdminDate(log.createdAt)} />
          <DetailRow label="操作人" value={log.actorEmail} />
          <DetailRow label="动作" value={log.action} mono />
          <DetailRow label="资源类型" value={log.resourceType || '—'} mono />
          <DetailRow
            label="资源 ID"
            value={log.resourceId ? <AdminIdCell value={log.resourceId} label="资源" /> : '—'}
          />
          <DetailRow
            label="目标租户"
            value={
              log.targetTenantId ? (
                <AdminIdCell value={log.targetTenantId} label="租户" />
              ) : (
                '—'
              )
            }
          />
          <DetailRow label="跨租户" value={log.crossTenant ? '是' : '否'} />
          <div>
            <dt className="text-muted-foreground">详情</dt>
            <dd className="mt-1 whitespace-pre-wrap break-words font-mono text-xs leading-relaxed">
              {log.detail ?? '—'}
            </dd>
          </div>
        </dl>
        <div className="mt-6 flex flex-wrap gap-2">
          {usersLink ? (
            <Link
              to={usersLink}
              className="text-sm text-primary underline-offset-4 hover:underline"
            >
              查用户
            </Link>
          ) : null}
          {billingLink ? (
            <Link
              to={billingLink}
              className="text-sm text-primary underline-offset-4 hover:underline"
            >
              查看计费
            </Link>
          ) : null}
          {canReadTenants && log.targetTenantId ? (
            <Link
              to={`/tenants/${log.targetTenantId}?tab=info`}
              className="text-sm text-primary underline-offset-4 hover:underline"
            >
              租户详情
            </Link>
          ) : null}
        </div>
      </SheetContent>
    </Sheet>
  )
}

function DetailRow({
  label,
  value,
  mono = false,
}: {
  label: string
  value: ReactNode
  mono?: boolean
}) {
  return (
    <div>
      <dt className="text-muted-foreground">{label}</dt>
      <dd className={mono ? 'mt-1 font-mono text-xs' : 'mt-1'}>{value}</dd>
    </div>
  )
}
