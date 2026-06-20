import { Button, Tabs, TabsContent, TabsList, TabsTrigger } from '@repo/ui'
import { useQuery } from '@tanstack/react-query'
import {
  AlertTriangleIcon,
  ArrowLeftIcon,
  Building2Icon,
  InfoIcon,
  PencilIcon,
  ScaleIcon,
  ShieldPlusIcon,
  SparklesIcon,
  UsersIcon,
} from 'lucide-react'
import { useCallback, useMemo, useState } from 'react'
import { Link, useSearchParams } from 'react-router'

import { AUDIT_READ_PERMISSIONS } from '~/features/audit-logs/lib/audit-log-permissions'
import { StartImpersonationSheet } from '~/features/impersonation/ui/start-impersonation-sheet'
import { MembersAdminPage } from '~/features/members/ui/members-admin-page'
import { TenantCustomRolesPanel } from '~/features/roles/ui/tenant-custom-roles-panel'
import { resolveTenantDetailTab } from '~/features/tenants/lib/tenant-detail-nav'
import { fetchAdminTenant } from '~/shared/api/admin-api'
import { canAccessAdminMembers, isPlatformAdmin } from '~/shared/auth/admin-access'
import { useAdminPermissions } from '~/shared/hooks/use-admin-permissions'
import { adminQueryKeys } from '~/shared/lib/admin-query-keys'
import { AdminEmptyState, AdminPanel } from '~/shared/ui/admin-page-shell'
import { AdminDetailSkeleton } from '~/shared/ui/admin-table-skeleton'

import { EditTenantSheet } from './edit-tenant-sheet'
import { TenantCompliancePanel } from './tenant-compliance-panel'
import { TenantDetailHero } from './tenant-detail-hero'
import { TenantDetailMetrics } from './tenant-detail-metrics'
import { TenantDetailQuickActions } from './tenant-detail-quick-actions'
import { TenantFeaturesPanel } from './tenant-features-panel'

const BILLING_PERMISSIONS = [
  'admin:billing:read',
  'admin:billing:adjust',
  'admin:billing:packages:write',
  'admin:billing:refund',
] as const

export function TenantDetailPage({ tenantId }: { tenantId: string }) {
  const { can, canAny, session } = useAdminPermissions()
  const canWrite = can('admin:tenants:write')
  const canReadMembers = canAccessAdminMembers(session)
  const canReadUsers = can('admin:users:read')
  const canViewBilling = canAny([...BILLING_PERMISSIONS])
  const canViewAudit = canAny([...AUDIT_READ_PERMISSIONS])
  const homeTenantId = session?.homeTenant?.id ?? session?.tenant?.id
  const canImpersonate =
    can('admin:impersonate') && isPlatformAdmin(session) && homeTenantId !== tenantId
  const [searchParams, setSearchParams] = useSearchParams()

  const [editOpen, setEditOpen] = useState(false)
  const [impersonateOpen, setImpersonateOpen] = useState(false)

  const activeTab = useMemo(
    () => resolveTenantDetailTab(searchParams.get('tab'), { canReadMembers }),
    [searchParams, canReadMembers],
  )

  const setActiveTab = useCallback(
    (tab: string) => {
      setSearchParams(
        (prev) => {
          const next = new URLSearchParams(prev)
          next.set('tab', tab)
          return next
        },
        { replace: true },
      )
    },
    [setSearchParams],
  )

  const tenantQuery = useQuery({
    queryKey: adminQueryKeys.tenant(tenantId),
    queryFn: () => fetchAdminTenant(tenantId),
    retry: false,
  })

  const tenant = tenantQuery.data

  if (tenantQuery.isLoading) {
    return (
      <div className="space-y-6 admin-stagger">
        <AdminDetailSkeleton />
      </div>
    )
  }

  if (tenantQuery.isError || !tenant) {
    return (
      <div className="space-y-4">
        <Button
          variant="ghost"
          size="sm"
          className="-ml-2 w-fit"
          nativeButton={false}
          render={<Link to="/tenants" />}
        >
          <ArrowLeftIcon className="size-3.5" />
          返回列表
        </Button>
        <AdminPanel>
          <AdminEmptyState
            icon={Building2Icon}
            message="租户不存在或无权访问"
            onRetry={() => void tenantQuery.refetch()}
            isRetrying={tenantQuery.isFetching}
          />
        </AdminPanel>
      </div>
    )
  }

  const suspended = tenant.status === 'suspended'

  return (
    <div className="space-y-6 admin-stagger">
      <Button
        variant="ghost"
        size="sm"
        className="-ml-2 w-fit"
        nativeButton={false}
        render={<Link to="/tenants" />}
      >
        <ArrowLeftIcon className="size-3.5" />
        租户列表
      </Button>

      <TenantDetailHero
        tenant={tenant}
        actions={
          canWrite ? (
            <Button variant="outline" size="sm" onClick={() => setEditOpen(true)}>
              <PencilIcon className="size-3.5" />
              编辑租户
            </Button>
          ) : null
        }
      />

      {suspended ? (
        <div
          className="flex gap-2 rounded-lg border border-destructive/30 bg-destructive/8 px-4 py-3 text-sm text-destructive"
          role="alert"
        >
          <AlertTriangleIcon className="mt-0.5 size-4 shrink-0" aria-hidden />
          <p>
            该租户已停用，成员无法登录，API 访问也会被拒绝。可在「编辑租户」中恢复为正常状态。
          </p>
        </div>
      ) : null}

      <Tabs value={activeTab} onValueChange={setActiveTab} className="admin-stagger gap-4">
        <TabsList className="h-auto flex-wrap">
          <TabsTrigger value="info">
            <InfoIcon className="size-3.5" />
            概览
          </TabsTrigger>
          {canReadMembers ? (
            <TabsTrigger value="members">
              <UsersIcon className="size-3.5" />
              成员
            </TabsTrigger>
          ) : null}
          {canReadMembers ? (
            <TabsTrigger value="custom-roles">
              <ShieldPlusIcon className="size-3.5" />
              自定义角色
            </TabsTrigger>
          ) : null}
          <TabsTrigger value="features">
            <SparklesIcon className="size-3.5" />
            能力
          </TabsTrigger>
          <TabsTrigger value="compliance">
            <ScaleIcon className="size-3.5" />
            合规
          </TabsTrigger>
        </TabsList>

        <TabsContent value="info" className="mt-4 space-y-6">
          <TenantDetailMetrics tenantId={tenantId} />
          <TenantDetailQuickActions
            tenantId={tenantId}
            canReadMembers={canReadMembers}
            canReadUsers={canReadUsers}
            canViewBilling={canViewBilling}
            canViewAudit={canViewAudit}
            canImpersonate={canImpersonate}
            onOpenMembers={() => setActiveTab('members')}
            onImpersonate={() => setImpersonateOpen(true)}
          />
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

        <TabsContent value="compliance" className="mt-4">
          <TenantCompliancePanel tenantId={tenantId} tenantSlug={tenant.slug} />
        </TabsContent>
      </Tabs>

      <EditTenantSheet tenant={tenant} open={editOpen} onOpenChange={setEditOpen} />
      <StartImpersonationSheet
        tenantId={tenantId}
        tenantLabel={`${tenant.name} (${tenant.slug})`}
        open={impersonateOpen}
        onOpenChange={setImpersonateOpen}
      />
    </div>
  )
}
