import type { ReactNode } from 'react'
import { Button, toast } from '@repo/ui'
import {
  BuildingIcon,
  CopyIcon,
  CreditCardIcon,
  ExternalLinkIcon,
  UsersIcon,
} from 'lucide-react'
import { Link } from 'react-router'

import { buildAuditBillingLink } from '~/features/audit-logs/lib/audit-log-billing-nav'
import {
  formatAuditDetailContent,
  formatAuditActionLabel,
} from '~/features/audit-logs/lib/audit-log-labels'
import { buildAuditUsersLink } from '~/features/audit-logs/lib/audit-log-users-nav'
import { AuditLogDetailPreview } from '~/features/audit-logs/ui/audit-log-detail-preview'
import type { AdminAuditLogEntry } from '~/shared/api/admin-api'
import { AdminIdCell } from '~/shared/ui/admin-id-cell'
import { AdminPanel } from '~/shared/ui/admin-page-shell'
import { AdminStatusPill } from '~/shared/ui/admin-status-pill'

export function AuditLogDetailBody({
  log,
  canReadTenants,
  canReadUsers,
}: {
  log: AdminAuditLogEntry
  canReadTenants: boolean
  canReadUsers: boolean
}) {
  const billingLink = buildAuditBillingLink(log.action, log.targetTenantId)
  const usersLink = canReadUsers ? buildAuditUsersLink(log.actorEmail, log.targetTenantId) : null
  const tenantLink =
    canReadTenants && log.targetTenantId ? `/tenants/${log.targetTenantId}?tab=info` : null
  const detailContent = formatAuditDetailContent(log.detail)

  async function copyLogId() {
    try {
      await navigator.clipboard.writeText(log.id)
      toast.success('已复制日志 ID')
    } catch {
      toast.error('复制失败')
    }
  }

  async function copyDetail() {
    if (detailContent.empty) return
    try {
      await navigator.clipboard.writeText(detailContent.text)
      toast.success('已复制详情内容')
    } catch {
      toast.error('复制失败')
    }
  }

  return (
    <div className="space-y-6">
      <AuditLogDetailPreview log={log} />

      <div className="grid gap-6 lg:grid-cols-2">
        <DetailSection title="操作主体">
          <DetailField label="操作人邮箱" value={log.actorEmail} />
          <DetailField
            label="操作人 ID"
            value={log.actorUserId ? <AdminIdCell value={log.actorUserId} label="用户" /> : '—'}
          />
          <DetailField
            label="日志 ID"
            value={
              <span className="flex flex-wrap items-center gap-2">
                <AdminIdCell value={log.id} label="日志" />
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  className="h-7 px-2"
                  onClick={() => void copyLogId()}
                >
                  <CopyIcon className="size-3.5" />
                  复制
                </Button>
              </span>
            }
          />
        </DetailSection>

        <DetailSection title="目标资源">
          <DetailField label="动作码" value={log.action} mono />
          <DetailField label="资源类型" value={log.resourceType || '—'} mono />
          <DetailField
            label="资源 ID"
            value={log.resourceId ? <AdminIdCell value={log.resourceId} label="资源" /> : '—'}
          />
          <DetailField
            label="目标租户"
            value={
              log.targetTenantId ? <AdminIdCell value={log.targetTenantId} label="租户" /> : '—'
            }
          />
          <DetailField
            label="跨租户"
            value={
              log.crossTenant ? (
                <AdminStatusPill level="warn" label="是 · 平台跨租户操作" />
              ) : (
                <span className="text-muted-foreground">否</span>
              )
            }
          />
        </DetailSection>
      </div>

      <DetailSection
        title="变更详情"
        action={
          !detailContent.empty ? (
            <Button
              type="button"
              variant="ghost"
              size="sm"
              className="h-7 px-2 text-xs"
              onClick={() => void copyDetail()}
            >
              <CopyIcon className="size-3.5" />
              复制
            </Button>
          ) : null
        }
      >
        {detailContent.empty ? (
          <p className="px-4 py-3 text-sm text-muted-foreground">无附加详情</p>
        ) : (
          <AdminPanel className="border-0 bg-background/30 p-0 shadow-none">
            <pre
              className={
                detailContent.isJson
                  ? 'max-h-[min(28rem,50vh)] overflow-auto p-4 font-mono text-[11px] leading-relaxed text-foreground/90'
                  : 'max-h-[min(28rem,50vh)] overflow-auto whitespace-pre-wrap break-words p-4 text-xs leading-relaxed text-foreground/90'
              }
            >
              {detailContent.text}
            </pre>
          </AdminPanel>
        )}
      </DetailSection>

      {(usersLink || billingLink || tenantLink) && (
        <AdminPanel className="flex flex-wrap gap-2 px-4 py-3 md:px-5">
          {usersLink ? (
            <Button nativeButton={false} variant="outline" size="sm" render={<Link to={usersLink} />}>
              <UsersIcon className="size-3.5" />
              查用户
              <ExternalLinkIcon className="size-3 opacity-60" aria-hidden />
            </Button>
          ) : null}
          {billingLink ? (
            <Button nativeButton={false} variant="outline" size="sm" render={<Link to={billingLink} />}>
              <CreditCardIcon className="size-3.5" />
              查看计费
              <ExternalLinkIcon className="size-3 opacity-60" aria-hidden />
            </Button>
          ) : null}
          {tenantLink ? (
            <Button nativeButton={false} variant="outline" size="sm" render={<Link to={tenantLink} />}>
              <BuildingIcon className="size-3.5" />
              租户详情
              <ExternalLinkIcon className="size-3 opacity-60" aria-hidden />
            </Button>
          ) : null}
        </AdminPanel>
      )}
    </div>
  )
}

function DetailSection({
  title,
  action,
  children,
}: {
  title: string
  action?: ReactNode
  children: ReactNode
}) {
  return (
    <section className="space-y-3">
      <div className="flex items-center justify-between gap-2">
        <h3 className="admin-display text-[10px] tracking-[0.18em] text-muted-foreground uppercase">
          {title}
        </h3>
        {action}
      </div>
      <div className="divide-y divide-border/50 rounded-xl border border-border/50 bg-background/20">
        {children}
      </div>
    </section>
  )
}

function DetailField({
  label,
  value,
  mono = false,
}: {
  label: string
  value: ReactNode
  mono?: boolean
}) {
  return (
    <div className="grid gap-1 px-4 py-3 sm:grid-cols-[108px_minmax(0,1fr)] sm:items-start sm:gap-3">
      <dt className="text-xs text-muted-foreground">{label}</dt>
      <dd className={mono ? 'font-mono text-xs break-all' : 'text-sm break-words'}>{value}</dd>
    </div>
  )
}
