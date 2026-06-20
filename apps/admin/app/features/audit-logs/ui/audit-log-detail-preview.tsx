import { Badge } from '@repo/ui'
import {
  BuildingIcon,
  CreditCardIcon,
  ScrollTextIcon,
  ShieldIcon,
  UserCogIcon,
  UsersIcon,
  UsersRoundIcon,
} from 'lucide-react'
import type { LucideIcon } from 'lucide-react'

import {
  AUDIT_ACTION_CATEGORY_LABELS,
  auditActorInitials,
  formatAuditActionLabel,
  getAuditActionCategory,
  getAuditActionVerb,
  type AuditActionCategory,
} from '~/features/audit-logs/lib/audit-log-labels'
import type { AdminAuditLogEntry } from '~/shared/api/admin-api'
import { AdminStatusPill } from '~/shared/ui/admin-status-pill'
import { formatAdminDate } from '~/shared/ui/admin-status-badge'

const CATEGORY_ICONS: Record<AuditActionCategory, LucideIcon> = {
  tenant: BuildingIcon,
  member: UsersRoundIcon,
  user: UsersIcon,
  rbac: ShieldIcon,
  billing: CreditCardIcon,
  audit: ScrollTextIcon,
  impersonation: UserCogIcon,
  other: ScrollTextIcon,
}

const VERB_BADGE_VARIANT = {
  create: 'secondary',
  update: 'outline',
  delete: 'destructive',
  other: 'outline',
} as const

const VERB_LABELS = {
  create: '创建',
  update: '更新',
  delete: '删除',
  other: '操作',
} as const

export function AuditLogDetailPreview({ log }: { log: AdminAuditLogEntry }) {
  const category = getAuditActionCategory(log.action)
  const verb = getAuditActionVerb(log.action)
  const CategoryIcon = CATEGORY_ICONS[category]

  return (
    <section className="admin-create-tenant-preview rounded-xl border border-primary/25 bg-primary/6 p-4">
      <p className="admin-display text-[10px] tracking-[0.2em] text-primary/70 uppercase">
        Audit Event
      </p>
      <div className="mt-3 flex items-start gap-3">
        <span
          className="admin-tenant-avatar flex size-11 shrink-0 items-center justify-center rounded-xl border border-primary/30 bg-primary/12 text-sm font-semibold text-primary"
          aria-hidden
        >
          {auditActorInitials(log.actorEmail)}
        </span>
        <div className="min-w-0 flex-1">
          <p className="text-base font-semibold leading-snug">{formatAuditActionLabel(log.action)}</p>
          <p className="mt-0.5 truncate font-mono text-[11px] text-muted-foreground">{log.action}</p>
          <div className="mt-2 flex flex-wrap items-center gap-1.5">
            <Badge variant="outline" className="gap-1 text-[10px]">
              <CategoryIcon className="size-3" aria-hidden />
              {AUDIT_ACTION_CATEGORY_LABELS[category]}
            </Badge>
            <Badge variant={VERB_BADGE_VARIANT[verb]} className="text-[10px]">
              {VERB_LABELS[verb]}
            </Badge>
            {log.crossTenant ? (
              <AdminStatusPill level="warn" label="跨租户" className="py-0.5 text-[10px]" />
            ) : null}
          </div>
        </div>
      </div>
      <dl className="mt-3 grid gap-1 text-xs text-muted-foreground sm:grid-cols-2">
        <div>
          <dt className="inline text-muted-foreground/80">操作人：</dt>
          <dd className="inline">{log.actorEmail}</dd>
        </div>
        <div>
          <dt className="inline text-muted-foreground/80">时间：</dt>
          <dd className="inline">{formatAdminDate(log.createdAt)}</dd>
        </div>
      </dl>
    </section>
  )
}
