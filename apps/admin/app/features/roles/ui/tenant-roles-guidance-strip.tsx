import { Button } from '@repo/ui'
import { Link2Icon, PlusIcon, UsersIcon } from 'lucide-react'
import { Link } from 'react-router'

import { appendAdminListTotal } from '~/shared/lib/format-admin-list-description'

export function TenantRolesGuidanceStrip({
  tenantId,
  tenantLabel,
  total,
  loaded,
  embedded = false,
  canWrite = false,
  onCreate,
}: {
  tenantId: string
  tenantLabel: string
  total: number
  loaded: boolean
  embedded?: boolean
  canWrite?: boolean
  onCreate?: () => void
}) {
  const description = embedded
    ? appendAdminListTotal('为本租户定义角色并配置 tenant / workspace 权限集合。', {
        total,
        loaded,
        unit: '个',
      })
    : appendAdminListTotal(`${tenantLabel} · 租户级 RBAC 角色与权限。`, {
        total,
        loaded,
        unit: '个',
      })

  return (
    <section
      className={
        embedded
          ? 'rounded-xl border border-border/50 bg-background/20 px-4 py-3'
          : 'admin-create-tenant-preview rounded-xl border border-primary/25 bg-primary/6 px-4 py-4 md:px-5'
      }
    >
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div className="min-w-0 flex-1">
          <p className="admin-display text-[10px] tracking-[0.2em] text-primary/70 uppercase">
            {embedded ? 'RBAC' : 'Role Registry'}
          </p>
          {!embedded ? <p className="mt-1 text-sm font-medium">{tenantLabel}</p> : null}
          <p className="mt-1 text-xs leading-relaxed text-muted-foreground">{description}</p>
        </div>
        <div className="flex flex-wrap gap-2">
          <Button
            nativeButton={false}
            variant="outline"
            size="sm"
            render={<Link to={`/members?tenantId=${encodeURIComponent(tenantId)}`} />}
          >
            <UsersIcon className="size-3.5" />
            成员管理
          </Button>
          {canWrite ? (
            <Button size="sm" onClick={onCreate}>
              <PlusIcon className="size-3.5" />
              新建角色
            </Button>
          ) : null}
        </div>
      </div>
      {embedded ? (
        <p className="mt-2 inline-flex items-center gap-1.5 text-[11px] text-muted-foreground">
          <Link2Icon className="size-3" aria-hidden />
          平台系统角色请在「角色与权限」页管理；此处仅配置本租户自定义角色。
        </p>
      ) : null}
    </section>
  )
}
