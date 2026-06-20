import { ShieldIcon } from 'lucide-react'

import type { TenantRoleSummary } from '~/entities/tenant-role'

export function EditTenantRolePreview({
  role,
  name,
  description,
}: {
  role: TenantRoleSummary
  name: string
  description: string
}) {
  const previewName = name.trim() || role.name

  return (
    <div className="admin-create-tenant-preview rounded-xl border border-primary/25 bg-primary/6 p-4">
      <p className="admin-display text-[10px] tracking-[0.2em] text-primary/70 uppercase">
        变更预览
      </p>
      <div className="mt-3 flex items-start gap-3">
        <span
          className="admin-tenant-avatar flex size-11 shrink-0 items-center justify-center rounded-xl border border-primary/30 bg-primary/12 text-sm font-semibold text-primary"
          aria-hidden
        >
          {role.code.slice(0, 2).toUpperCase()}
        </span>
        <div className="min-w-0 flex-1">
          <p className="truncate text-base font-semibold">{previewName}</p>
          <p className="mt-0.5 font-mono text-xs text-muted-foreground">{role.code}</p>
          <div className="mt-2 flex flex-wrap items-center gap-1.5">
            <span className="rounded-md border border-border/60 bg-background/40 px-2 py-0.5 text-[11px]">
              {role.permissionCount} 项权限
            </span>
            <span className="rounded-md border border-border/60 bg-background/40 px-2 py-0.5 text-[11px]">
              {role.memberCount} 名成员
            </span>
            {role.system ? (
              <span className="rounded-md border border-border/60 bg-background/40 px-2 py-0.5 text-[11px] text-muted-foreground">
                系统内置
              </span>
            ) : (
              <span className="rounded-md border border-primary/30 bg-primary/8 px-2 py-0.5 text-[11px] text-primary">
                自定义
              </span>
            )}
          </div>
        </div>
        <ShieldIcon className="size-4 shrink-0 text-primary/50" aria-hidden />
      </div>
      {description.trim() ? (
        <p className="mt-3 text-xs leading-relaxed text-muted-foreground">{description.trim()}</p>
      ) : (
        <p className="mt-3 text-xs text-muted-foreground/70">暂无角色描述</p>
      )}
    </div>
  )
}
