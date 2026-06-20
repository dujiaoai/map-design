import { Button, useConfirmDialog } from '@repo/ui'
import { useQuery } from '@tanstack/react-query'
import { ArrowLeftIcon, ShieldPlusIcon } from 'lucide-react'
import { useCallback, useState } from 'react'
import { Link, useNavigate } from 'react-router'

import {
  buildAfterCreateTenantRoleHref,
  buildCreateTenantRoleCancelHref,
  parseTenantRoleNavFrom,
} from '~/features/roles/lib/tenant-role-nav'
import { CreateTenantRoleForm } from '~/features/roles/ui/create-tenant-role-form'
import { fetchAdminTenant, fetchTenantAssignablePermissions } from '~/shared/api/admin-api'
import { adminQueryKeys } from '~/shared/lib/admin-query-keys'
import { AdminTenantContextBanner } from '~/shared/ui/admin-tenant-context-banner'

export function CreateTenantRolePage({
  tenantId,
  from,
}: {
  tenantId: string
  from: string | null
}) {
  const navigate = useNavigate()
  const { confirm, confirmDialog } = useConfirmDialog()
  const [formDirty, setFormDirty] = useState(false)
  const navFrom = parseTenantRoleNavFrom(from)

  const tenantQuery = useQuery({
    queryKey: adminQueryKeys.tenant(tenantId),
    queryFn: () => fetchAdminTenant(tenantId),
    staleTime: 60_000,
  })

  const permissionsQuery = useQuery({
    queryKey: adminQueryKeys.tenantAssignablePermissions(tenantId),
    queryFn: () => fetchTenantAssignablePermissions(tenantId),
  })

  const tenantContextLabel = tenantQuery.data
    ? `${tenantQuery.data.name} (${tenantQuery.data.slug})`
    : '当前租户'

  const cancelHref = buildCreateTenantRoleCancelHref(tenantId, from)

  const requestLeave = useCallback(async () => {
    if (
      formDirty &&
      !(await confirm({
        title: '放弃新建',
        description: '已填写的内容尚未保存，确定离开？',
        confirmLabel: '离开',
      }))
    ) {
      return false
    }
    return true
  }, [confirm, formDirty])

  async function handleCancel() {
    if (!(await requestLeave())) return
    void navigate(cancelHref)
  }

  return (
    <div className="space-y-6 admin-stagger">
      <Button
        variant="ghost"
        size="sm"
        className="-ml-2 w-fit"
        nativeButton={false}
        render={<Link to={cancelHref} onClick={(event) => {
          if (!formDirty) return
          event.preventDefault()
          void handleCancel()
        }} />}
      >
        <ArrowLeftIcon className="size-3.5" />
        {navFrom === 'tenant-detail' ? '返回租户角色' : '返回角色列表'}
      </Button>

      <section className="admin-create-tenant-preview rounded-xl border border-primary/25 bg-primary/6 px-4 py-4 md:px-5">
        <div className="flex flex-wrap items-start gap-4">
          <span className="admin-tenant-avatar flex size-12 shrink-0 items-center justify-center rounded-xl border border-primary/30 bg-primary/12 text-primary">
            <ShieldPlusIcon className="size-5" aria-hidden />
          </span>
          <div className="min-w-0 flex-1">
            <p className="admin-display text-[10px] tracking-[0.22em] text-primary/70 uppercase">
              Role Onboarding
            </p>
            <h1 className="admin-display mt-1 text-xl font-semibold">新建自定义角色</h1>
            <p className="mt-1 text-sm text-muted-foreground">{tenantContextLabel}</p>
            <p className="mt-2 text-xs leading-relaxed text-muted-foreground">
              为租户定义独立角色码与权限集合；成员邀请与分配将自动包含新建角色。
            </p>
          </div>
        </div>
      </section>

      {navFrom !== 'tenant-detail' ? (
        <AdminTenantContextBanner
          tenantId={tenantId}
          tenantLabel={tenantContextLabel}
          showMembersLink
        />
      ) : null}

      <CreateTenantRoleForm
        tenantId={tenantId}
        permissions={permissionsQuery.data?.permissions ?? []}
        permissionsLoading={permissionsQuery.isPending}
        permissionsError={permissionsQuery.isError}
        onDirtyChange={setFormDirty}
        onCancel={() => void handleCancel()}
        onCreated={(role) => {
          void navigate(buildAfterCreateTenantRoleHref(tenantId, from, role.id))
        }}
      />

      {confirmDialog}
    </div>
  )
}
