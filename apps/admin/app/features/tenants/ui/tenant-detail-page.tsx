import { Button, Tabs, TabsContent, TabsList, TabsTrigger } from '@repo/ui'
import { useQuery } from '@tanstack/react-query'
import {
  ArrowLeftIcon,
  Building2Icon,
  CreditCardIcon,
  InfoIcon,
  PencilIcon,
  ScrollTextIcon,
  ShieldPlusIcon,
  SparklesIcon,
  UsersIcon,
} from 'lucide-react'
import { useCallback, useMemo, useState } from 'react'
import { Link, useSearchParams } from 'react-router'

import { AUDIT_READ_PERMISSIONS } from '~/features/audit-logs/lib/audit-log-permissions'
import { buildAuditLogsLink } from '~/features/audit-logs/lib/audit-log-nav'
import { MembersAdminPage } from '~/features/members/ui/members-admin-page'
import { TenantCustomRolesPanel } from '~/features/roles/ui/tenant-custom-roles-panel'
import { resolveTenantDetailTab } from '~/features/tenants/lib/tenant-detail-nav'
import { fetchAdminTenant, type AdminTenantSummary } from '~/shared/api/admin-api'
import { canAccessAdminMembers } from '~/shared/auth/admin-access'
import { useAdminPermissions } from '~/shared/hooks/use-admin-permissions'
import { adminQueryKeys } from '~/shared/lib/admin-query-keys'
import {
  AdminConfigRow,
  AdminEmptyState,
  AdminPageHeader,
  AdminPanel,
  AdminPanelHeader,
} from '~/shared/ui/admin-page-shell'
import { AdminDetailSkeleton } from '~/shared/ui/admin-table-skeleton'
import { AdminStatusBadge, formatAdminDate } from '~/shared/ui/admin-status-badge'

import { EditTenantSheet } from './edit-tenant-sheet'
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
  const [searchParams, setSearchParams] = useSearchParams()

  const [editOpen, setEditOpen] = useState(false)

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

      <AdminPageHeader
        eyebrow="Tenant"
        title={tenant.name}
        description={
          <span className="inline-flex flex-wrap items-center gap-2">
            <span className="font-mono text-xs">{tenant.slug}</span>
            <span className="text-muted-foreground">·</span>
            <span>{tenant.plan}</span>
            <AdminStatusBadge status={tenant.status} />
          </span>
        }
        actions={
          canWrite ? (
            <Button variant="outline" onClick={() => setEditOpen(true)}>
              <PencilIcon className="size-3.5" />
              编辑
            </Button>
          ) : null
        }
      />

      <Tabs value={activeTab} onValueChange={setActiveTab} className="admin-stagger gap-4">
        <TabsList className="h-auto flex-wrap">
          <TabsTrigger value="info">
            <InfoIcon className="size-3.5" />
            信息
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
        </TabsList>

        <TabsContent value="info" className="mt-4">
          <TenantInfoPanel
            tenant={tenant}
            tenantId={tenantId}
            canReadMembers={canReadMembers}
            canReadUsers={canReadUsers}
            canViewBilling={canViewBilling}
            canViewAudit={canViewAudit}
            onOpenMembers={() => setActiveTab('members')}
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
      </Tabs>

      <EditTenantSheet tenant={tenant} open={editOpen} onOpenChange={setEditOpen} />
    </div>
  )
}

function TenantInfoPanel({
  tenant,
  tenantId,
  canReadMembers,
  canReadUsers,
  canViewBilling,
  canViewAudit,
  onOpenMembers,
}: {
  tenant: AdminTenantSummary
  tenantId: string
  canReadMembers: boolean
  canReadUsers: boolean
  canViewBilling: boolean
  canViewAudit: boolean
  onOpenMembers: () => void
}) {
  const hasQuickLinks = canReadMembers || canReadUsers || canViewBilling || canViewAudit

  return (
    <AdminPanel>
      <AdminPanelHeader
        icon={Building2Icon}
        title="基本信息"
        description="租户标识与订阅计划"
      />
      <AdminConfigRow label="Slug" value={tenant.slug} mono />
      <AdminConfigRow label="计划" value={tenant.plan} mono />
      <AdminConfigRow label="状态" value={<AdminStatusBadge status={tenant.status} />} />
      <AdminConfigRow
        label="创建时间"
        value={formatAdminDate(tenant.createdAt)}
      />
      <AdminConfigRow label="租户 ID" value={tenant.id} mono />

      {hasQuickLinks ? (
        <div className="flex flex-wrap gap-2 border-t border-border/50 px-4 py-4 md:px-5">
          {canReadMembers ? (
            <Button type="button" variant="outline" size="sm" onClick={onOpenMembers}>
              <UsersIcon className="size-3.5" />
              成员管理
            </Button>
          ) : null}
          {canReadUsers ? (
            <Button
              nativeButton={false}
              variant="outline"
              size="sm"
              render={<Link to={`/users?tenantId=${tenantId}`} />}
            >
              <UsersIcon className="size-3.5" />
              用户列表
            </Button>
          ) : null}
          {canViewBilling ? (
            <Button
              nativeButton={false}
              variant="outline"
              size="sm"
              render={
                <Link to={`/billing?tab=wallets&tenantId=${encodeURIComponent(tenantId)}`} />
              }
            >
              <CreditCardIcon className="size-3.5" />
              计费钱包
            </Button>
          ) : null}
          {canViewAudit ? (
            <Button
              nativeButton={false}
              variant="outline"
              size="sm"
              render={<Link to={buildAuditLogsLink({ tenantId })} />}
            >
              <ScrollTextIcon className="size-3.5" />
              审计日志
            </Button>
          ) : null}
        </div>
      ) : null}
    </AdminPanel>
  )
}
