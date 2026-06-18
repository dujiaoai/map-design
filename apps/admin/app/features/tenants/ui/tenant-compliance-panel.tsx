import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { DatabaseIcon, KeyRoundIcon, LayoutListIcon, PackageIcon } from 'lucide-react'

import {
  createTenantDataExportRequest,
  fetchTenantDataExportRequests,
  fetchTenantMenuOverrides,
  fetchTenantOidcConfig,
  fetchTenantStorageEstimate,
} from '~/shared/api/admin-api'
import { useAdminPermissions } from '~/shared/hooks/use-admin-permissions'
import { adminQueryKeys } from '~/shared/lib/admin-query-keys'
import { formatAdminApiError } from '~/shared/lib/format-admin-api-error'
import {
  AdminConfigRow,
  AdminEmptyState,
  AdminPanel,
  AdminPanelHeader,
} from '~/shared/ui/admin-page-shell'
import { AdminTableSkeleton } from '~/shared/ui/admin-table-skeleton'
import { formatAdminDate } from '~/shared/ui/admin-status-badge'
import { TenantOidcConfigForm } from '~/features/tenants/ui/tenant-oidc-config-form'
import { Button, toast } from '@repo/ui'

function formatBytes(bytes: number): string {
  if (bytes === 0) return '0 B'
  const units = ['B', 'KB', 'MB', 'GB', 'TB']
  const index = Math.min(Math.floor(Math.log(bytes) / Math.log(1024)), units.length - 1)
  const value = bytes / 1024 ** index
  return `${value.toFixed(value >= 10 || index === 0 ? 0 : 1)} ${units[index]}`
}

export function TenantCompliancePanel({ tenantId }: { tenantId: string }) {
  const { can } = useAdminPermissions()
  const canWrite = can('admin:tenants:write')
  const queryClient = useQueryClient()

  const exportsQuery = useQuery({
    queryKey: adminQueryKeys.tenantDataExports(tenantId),
    queryFn: () => fetchTenantDataExportRequests(tenantId),
  })
  const oidcQuery = useQuery({
    queryKey: adminQueryKeys.tenantOidcConfig(tenantId),
    queryFn: () => fetchTenantOidcConfig(tenantId),
  })
  const storageQuery = useQuery({
    queryKey: adminQueryKeys.tenantStorageEstimate(tenantId),
    queryFn: () => fetchTenantStorageEstimate(tenantId),
  })
  const menuOverridesQuery = useQuery({
    queryKey: adminQueryKeys.tenantMenuOverrides(tenantId),
    queryFn: () => fetchTenantMenuOverrides(tenantId),
  })

  const createExportMutation = useMutation({
    mutationFn: () => createTenantDataExportRequest(tenantId),
    onSuccess: async () => {
      toast.success('已创建数据导出请求')
      await queryClient.invalidateQueries({ queryKey: adminQueryKeys.tenantDataExports(tenantId) })
    },
    onError: (error) => {
      toast.error(formatAdminApiError(error, '创建导出请求失败'))
    },
  })

  return (
    <div className="space-y-6 admin-stagger">
      <AdminPanel>
        <AdminPanelHeader
          icon={PackageIcon}
          title="GDPR 数据导出"
          description="租户数据包导出队列（异步打包待后续 Job）"
          actions={
            canWrite ? (
              <Button
                type="button"
                size="sm"
                disabled={createExportMutation.isPending}
                onClick={() => void createExportMutation.mutate()}
              >
                新建导出请求
              </Button>
            ) : null
          }
        />
        {exportsQuery.isLoading ? (
          <AdminTableSkeleton rows={2} columns={1} />
        ) : exportsQuery.isError ? (
          <AdminEmptyState
            icon={PackageIcon}
            message="无法加载导出请求"
            onRetry={() => void exportsQuery.refetch()}
            isRetrying={exportsQuery.isFetching}
          />
        ) : !exportsQuery.data?.requests.length ? (
          <p className="px-4 pb-4 text-sm text-muted-foreground">暂无导出请求</p>
        ) : (
          <ul className="divide-y divide-border/60 px-4 pb-4">
            {exportsQuery.data.requests.map((request) => (
              <li key={request.id} className="flex flex-wrap items-center justify-between gap-2 py-3 text-sm">
                <span className="font-mono text-xs text-muted-foreground">{request.id.slice(0, 8)}…</span>
                <span>{request.status}</span>
                <span className="text-muted-foreground">
                  {request.createdAt ? formatAdminDate(request.createdAt) : '—'}
                </span>
              </li>
            ))}
          </ul>
        )}
      </AdminPanel>

      <AdminPanel>
        <AdminPanelHeader
          icon={KeyRoundIcon}
          title="租户 OIDC / SSO"
          description="企业 IdP 连接配置（不含 client_secret）"
        />
        {oidcQuery.isLoading ? (
          <AdminTableSkeleton rows={3} columns={1} />
        ) : oidcQuery.isError || !oidcQuery.data ? (
          <AdminEmptyState
            icon={KeyRoundIcon}
            message="无法加载 OIDC 配置"
            onRetry={() => void oidcQuery.refetch()}
            isRetrying={oidcQuery.isFetching}
          />
        ) : (
          <TenantOidcConfigForm
            tenantId={tenantId}
            config={oidcQuery.data}
            readOnly={!canWrite}
          />
        )}
      </AdminPanel>

      <AdminPanel>
        <AdminPanelHeader
          icon={DatabaseIcon}
          title="存储用量估算"
          description="附件与地图图层字节数（FND-08g 骨架）"
        />
        {storageQuery.isLoading ? (
          <AdminTableSkeleton rows={2} columns={1} />
        ) : storageQuery.isError || !storageQuery.data ? (
          <AdminEmptyState
            icon={DatabaseIcon}
            message="无法加载存储估算"
            onRetry={() => void storageQuery.refetch()}
            isRetrying={storageQuery.isFetching}
          />
        ) : (
          <>
            <AdminConfigRow label="附件" value={formatBytes(storageQuery.data.attachmentBytes)} mono />
            <AdminConfigRow label="地图图层" value={formatBytes(storageQuery.data.mapLayerBytes)} mono />
            <AdminConfigRow label="合计" value={formatBytes(storageQuery.data.totalBytes)} mono />
            <AdminConfigRow label="数据来源" value={storageQuery.data.source} mono />
          </>
        )}
      </AdminPanel>

      <AdminPanel>
        <AdminPanelHeader
          icon={LayoutListIcon}
          title="菜单覆盖"
          description="相对平台模板的租户级 diff（Phase 5E-1 骨架）"
        />
        {menuOverridesQuery.isLoading ? (
          <AdminTableSkeleton rows={1} columns={1} />
        ) : menuOverridesQuery.isError ? (
          <AdminEmptyState
            icon={LayoutListIcon}
            message="无法加载菜单覆盖"
            onRetry={() => void menuOverridesQuery.refetch()}
            isRetrying={menuOverridesQuery.isFetching}
          />
        ) : !menuOverridesQuery.data?.overrides.length ? (
          <p className="px-4 pb-4 text-sm text-muted-foreground">无覆盖项，全部继承平台模板</p>
        ) : (
          <ul className="divide-y divide-border/60 px-4 pb-4">
            {menuOverridesQuery.data.overrides.map((row) => (
              <li key={row.id} className="flex flex-wrap gap-3 py-3 text-sm">
                <span className="font-mono text-xs">{row.itemId}</span>
                {row.title ? <span>{row.title}</span> : null}
                {row.enabled != null ? (
                  <span className="text-muted-foreground">{row.enabled ? '启用' : '禁用'}</span>
                ) : null}
              </li>
            ))}
          </ul>
        )}
      </AdminPanel>
    </div>
  )
}
