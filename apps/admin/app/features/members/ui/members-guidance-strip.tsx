import { Button } from '@repo/ui'
import { Link2Icon, UserPlusIcon, UsersIcon } from 'lucide-react'
import { Link } from 'react-router'

import { appendAdminListTotal } from '~/shared/lib/format-admin-list-description'

export function MembersGuidanceStrip({
  tenantId,
  tenantLabel,
  total,
  loaded,
  embedded = false,
  seatFull = false,
  canWrite = false,
  onInvite,
}: {
  tenantId: string
  tenantLabel: string
  total: number
  loaded: boolean
  embedded?: boolean
  seatFull?: boolean
  canWrite?: boolean
  onInvite?: () => void
}) {
  const description = embedded
    ? appendAdminListTotal('管理本租户成员、角色与邀请链接。', { total, loaded, unit: '名' })
    : appendAdminListTotal(`${tenantLabel} · 成员与席位管理。`, { total, loaded, unit: '名' })

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
            {embedded ? 'Members' : 'Member Registry'}
          </p>
          {!embedded ? <p className="mt-1 text-sm font-medium">{tenantLabel}</p> : null}
          <p className="mt-1 text-xs leading-relaxed text-muted-foreground">{description}</p>
          {seatFull ? (
            <p className="mt-1.5 text-xs text-destructive">成员席位已满，暂无法继续邀请。</p>
          ) : null}
        </div>
        <div className="flex flex-wrap gap-2">
          <Button
            nativeButton={false}
            variant="outline"
            size="sm"
            render={<Link to={`/users?tenantId=${encodeURIComponent(tenantId)}`} />}
          >
            <UsersIcon className="size-3.5" />
            用户列表
          </Button>
          {canWrite ? (
            <Button
              size="sm"
              disabled={seatFull}
              title={seatFull ? '成员席位已满' : undefined}
              onClick={onInvite}
            >
              <UserPlusIcon className="size-3.5" />
              邀请成员
            </Button>
          ) : null}
        </div>
      </div>
      {embedded ? (
        <p className="mt-2 inline-flex items-center gap-1.5 text-[11px] text-muted-foreground">
          <Link2Icon className="size-3" aria-hidden />
          跨租户视角请使用「用户列表」；本页仅管理当前租户成员。
        </p>
      ) : null}
    </section>
  )
}
