import { Button } from '@repo/ui'
import { UserPlusIcon, UsersIcon } from 'lucide-react'
import { Link } from 'react-router'

import { appendAdminListTotal } from '~/shared/lib/format-admin-list-description'

export function UsersGuidanceStrip({
  tenantFilterId,
  tenantLabel,
  total,
  loaded,
}: {
  tenantFilterId?: string
  tenantLabel: string
  total: number
  loaded: boolean
}) {
  if (tenantFilterId) {
    return (
      <section className="admin-create-tenant-preview rounded-xl border border-primary/25 bg-primary/6 px-4 py-4 md:px-5">
        <div className="flex flex-wrap items-start justify-between gap-4">
          <div className="min-w-0 flex-1">
            <p className="admin-display text-[10px] tracking-[0.2em] text-primary/70 uppercase">
              Tenant Scope
            </p>
            <p className="mt-1 text-sm font-medium">{tenantLabel}</p>
            <p className="mt-1 text-xs leading-relaxed text-muted-foreground">
              {appendAdminListTotal('本租户用户视图；新增成员请通过邀请链接或邮箱邀请。', {
                total,
                loaded,
                unit: '个',
              })}
            </p>
          </div>
          <Button
            nativeButton={false}
            variant="outline"
            size="sm"
            render={<Link to={`/tenants/${tenantFilterId}?tab=members`} />}
          >
            <UserPlusIcon className="size-3.5" />
            成员邀请
          </Button>
        </div>
      </section>
    )
  }

  return (
    <section className="admin-tenants-strip admin-health-strip px-4 py-4 md:px-5">
      <div className="relative flex flex-wrap items-start justify-between gap-4">
        <div>
          <p className="admin-display text-xs tracking-[0.22em] text-primary/75 uppercase">
            User Directory
          </p>
          <p className="mt-1 text-sm text-muted-foreground">
            {appendAdminListTotal(
              '跨租户用户目录；按租户筛选后可跳转成员管理。平台管理员角色在此编辑。',
              { total, loaded, unit: '个' },
            )}
          </p>
        </div>
        <div className="admin-tenants-strip-total rounded-xl border border-border/50 bg-background/30 px-4 py-2.5 text-right">
          <p className="inline-flex items-center gap-1.5 text-xs text-muted-foreground">
            <UsersIcon className="size-3.5 text-primary" aria-hidden />
            已加载
          </p>
          <p className="admin-display text-2xl font-semibold tabular-nums">{loaded ? total : '—'}</p>
        </div>
      </div>
    </section>
  )
}
