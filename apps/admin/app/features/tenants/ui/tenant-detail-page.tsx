import { Button, Tabs, TabsContent, TabsList, TabsTrigger } from '@repo/ui'
import { useQuery } from '@tanstack/react-query'
import { ArrowLeftIcon, PencilIcon } from 'lucide-react'
import { useState } from 'react'
import { Link } from 'react-router'

import { MembersAdminPage } from '~/features/members/ui/members-admin-page'
import { TenantCustomRolesPanel } from '~/features/roles/ui/tenant-custom-roles-panel'
import { fetchAdminTenant } from '~/shared/api/admin-api'
import { canAccessAdminMembers } from '~/shared/auth/admin-access'
import { useAdminPermissions } from '~/shared/hooks/use-admin-permissions'
import { adminQueryKeys } from '~/shared/lib/admin-query-keys'
import { AdminEmptyState, AdminPageHeader, AdminPanel } from '~/shared/ui/admin-page-shell'
import { AdminDetailSkeleton } from '~/shared/ui/admin-table-skeleton'
import { AdminStatusBadge, formatAdminDate } from '~/shared/ui/admin-status-badge'

import { EditTenantSheet } from './edit-tenant-sheet'
import { TenantFeaturesPanel } from './tenant-features-panel'

export function TenantDetailPage({ tenantId }: { tenantId: string }) {
  const { can, session } = useAdminPermissions()
  const canWrite = can('admin:tenants:write')
  const canReadMembers = canAccessAdminMembers(session)

  const [editOpen, setEditOpen] = useState(false)

  const tenantQuery = useQuery({
    queryKey: adminQueryKeys.tenant(tenantId),
    queryFn: () => fetchAdminTenant(tenantId),
    retry: false,
  })

  const tenant = tenantQuery.data

  if (tenantQuery.isLoading) {
    return <AdminDetailSkeleton />
  }

  if (tenantQuery.isError || !tenant) {
    return (
      <div className="space-y-4">
        <Button
          variant="ghost"
          size="sm"
          nativeButton={false}
          render={<Link to="/tenants" />}
        >
          <ArrowLeftIcon className="size-3.5" />
          返回列表
        </Button>
        <AdminEmptyState message="租户不存在或无权访问" />
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center gap-3">
        <Button
          variant="ghost"
          size="sm"
          nativeButton={false}
          render={<Link to="/tenants" />}
        >
          <ArrowLeftIcon className="size-3.5" />
          租户列表
        </Button>
      </div>

      <AdminPageHeader
        eyebrow="Tenant"
        title={tenant.name}
        description={`${tenant.slug} · ${tenant.plan}`}
        actions={
          canWrite ? (
            <Button variant="outline" onClick={() => setEditOpen(true)}>
              <PencilIcon className="size-3.5" />
              编辑
            </Button>
          ) : null
        }
      />

      <Tabs defaultValue="info">
        <TabsList>
          <TabsTrigger value="info">信息</TabsTrigger>
          {canReadMembers ? <TabsTrigger value="members">成员</TabsTrigger> : null}
          {canReadMembers ? <TabsTrigger value="custom-roles">自定义角色</TabsTrigger> : null}
          <TabsTrigger value="features">能力</TabsTrigger>
        </TabsList>

        <TabsContent value="info" className="mt-4">
          <AdminPanel className="grid gap-4 p-5 sm:grid-cols-2">
            <div>
              <p className="text-xs tracking-[0.14em] text-muted-foreground uppercase">Slug</p>
              <p className="mt-1 font-mono text-sm">{tenant.slug}</p>
            </div>
            <div>
              <p className="text-xs tracking-[0.14em] text-muted-foreground uppercase">计划</p>
              <p className="mt-1 font-mono text-sm">{tenant.plan}</p>
            </div>
            <div>
              <p className="text-xs tracking-[0.14em] text-muted-foreground uppercase">状态</p>
              <p className="mt-1">
                <AdminStatusBadge status={tenant.status} />
              </p>
            </div>
            <div>
              <p className="text-xs tracking-[0.14em] text-muted-foreground uppercase">创建时间</p>
              <p className="mt-1 text-sm text-muted-foreground">
                {formatAdminDate(tenant.createdAt)}
              </p>
            </div>
            <div className="sm:col-span-2">
              <p className="text-xs tracking-[0.14em] text-muted-foreground uppercase">租户 ID</p>
              <p className="mt-1 font-mono text-xs text-muted-foreground">{tenant.id}</p>
            </div>
          </AdminPanel>
        </TabsContent>

        {canReadMembers ? (
          <TabsContent value="members" className="mt-4">
            <MembersAdminPage tenantId={tenantId} tenantName={tenant.name} embedded />
          </TabsContent>
        ) : null}

        {canReadMembers ? (
          <TabsContent value="custom-roles" className="mt-4">
            <TenantCustomRolesPanel tenantId={tenantId} />
          </TabsContent>
        ) : null}

        <TabsContent value="features" className="mt-4">
          <TenantFeaturesPanel tenantId={tenantId} />
        </TabsContent>
      </Tabs>

      <EditTenantSheet tenant={tenant} open={editOpen} onOpenChange={setEditOpen} />
    </div>
  )
}
