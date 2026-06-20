import { Button } from '@repo/ui'
import { KeyRoundIcon, Link2Icon, ShieldIcon, UsersIcon } from 'lucide-react'
import { Link } from 'react-router'

import { appendAdminListTotal } from '~/shared/lib/format-admin-list-description'

export function SystemRolesGuidanceStrip({
  total,
  loaded,
  permissionsHref,
  tenantRolesHref,
}: {
  total: number
  loaded: boolean
  permissionsHref: string
  tenantRolesHref: string
}) {
  return (
    <section className="admin-create-tenant-preview rounded-xl border border-primary/25 bg-primary/6 px-4 py-4 md:px-5">
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div className="min-w-0 flex-1">
          <p className="admin-display text-[10px] tracking-[0.2em] text-primary/70 uppercase">
            Platform RBAC
          </p>
          <p className="mt-1 text-sm font-medium">系统内置角色</p>
          <p className="mt-1 text-xs leading-relaxed text-muted-foreground">
            {appendAdminListTotal(
              '配置平台级内置角色权限集合；租户自定义角色请在「自定义角色」页管理。',
              { total, loaded, unit: '个' },
            )}
          </p>
        </div>
        <div className="flex flex-wrap gap-2">
          <Button nativeButton={false} variant="outline" size="sm" render={<Link to={permissionsHref} />}>
            <KeyRoundIcon className="size-3.5" />
            权限目录
          </Button>
          <Button nativeButton={false} variant="outline" size="sm" render={<Link to="/users" />}>
            <UsersIcon className="size-3.5" />
            用户列表
          </Button>
          <Button nativeButton={false} variant="outline" size="sm" render={<Link to={tenantRolesHref} />}>
            <ShieldIcon className="size-3.5" />
            自定义角色
          </Button>
        </div>
      </div>
      <p className="mt-2 inline-flex items-center gap-1.5 text-[11px] text-muted-foreground">
        <Link2Icon className="size-3" aria-hidden />
        系统角色码不可新增或删除；保存权限后持有该角色的用户需重新登录生效。
      </p>
    </section>
  )
}
