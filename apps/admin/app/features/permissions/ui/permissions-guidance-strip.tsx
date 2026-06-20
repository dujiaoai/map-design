import { Button } from '@repo/ui'
import { KeyRoundIcon, Link2Icon, PlusIcon, ShieldIcon } from 'lucide-react'
import { Link } from 'react-router'

export function PermissionsGuidanceStrip({
  moduleTotal,
  permissionTotal,
  loaded,
  canWrite = false,
  onCreateModule,
  rolesHref,
  tenantRolesHref,
}: {
  moduleTotal: number
  permissionTotal: number
  loaded: boolean
  canWrite?: boolean
  onCreateModule?: () => void
  rolesHref: string
  tenantRolesHref: string
}) {
  const description = loaded
    ? `按模块组织 RBAC 权限码；系统内置模块由迁移维护，可新建自定义模块扩展能力。共 ${moduleTotal} 个模块、${permissionTotal} 项权限。`
    : '按模块组织 RBAC 权限码；系统内置模块由迁移维护，可新建自定义模块扩展能力。'

  return (
    <section className="admin-create-tenant-preview rounded-xl border border-primary/25 bg-primary/6 px-4 py-4 md:px-5">
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div className="min-w-0 flex-1">
          <p className="admin-display text-[10px] tracking-[0.2em] text-primary/70 uppercase">
            Permission Registry
          </p>
          <p className="mt-1 text-sm font-medium">权限目录</p>
          <p className="mt-1 text-xs leading-relaxed text-muted-foreground">{description}</p>
        </div>
        <div className="flex flex-wrap gap-2">
          <Button nativeButton={false} variant="outline" size="sm" render={<Link to={rolesHref} />}>
            <KeyRoundIcon className="size-3.5" />
            系统角色
          </Button>
          <Button nativeButton={false} variant="outline" size="sm" render={<Link to={tenantRolesHref} />}>
            <ShieldIcon className="size-3.5" />
            自定义角色
          </Button>
          {canWrite ? (
            <Button type="button" size="sm" onClick={onCreateModule}>
              <PlusIcon className="size-3.5" />
              新建模块
            </Button>
          ) : null}
        </div>
      </div>
      <p className="mt-2 inline-flex items-center gap-1.5 text-[11px] text-muted-foreground">
        <Link2Icon className="size-3" aria-hidden />
        完整权限码 = 模块码:动作段；分配权限请在「系统角色」或「自定义角色」页勾选保存。
      </p>
    </section>
  )
}
