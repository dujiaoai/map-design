import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { ActivityIcon, PlayIcon } from 'lucide-react'

import {
  fetchTenantSamlIdpHealth,
  runTenantSamlDisconnectDrill,
} from '~/entities/tenant/api'
import { useAdminPermissions } from '~/shared/hooks/use-admin-permissions'
import { adminQueryKeys } from '~/shared/lib/admin-query-keys'
import { formatAdminApiError } from '~/shared/lib/format-admin-api-error'
import {
  AdminEmptyState,
  AdminMetricCard,
  AdminPanel,
  AdminPanelHeader,
} from '~/shared/ui/admin-page-shell'
import { AdminTableSkeleton } from '~/shared/ui/admin-table-skeleton'
import { Button, toast } from '@repo/ui'

export function TenantSamlIdpHealthPanel({ tenantId }: { tenantId: string }) {
  const { can } = useAdminPermissions()
  const canWrite = can('admin:tenants:write')
  const queryClient = useQueryClient()

  const query = useQuery({
    queryKey: adminQueryKeys.tenantSamlIdpHealth(tenantId),
    queryFn: () => fetchTenantSamlIdpHealth(tenantId),
  })

  const drillMutation = useMutation({
    mutationFn: (idpEntityId?: string) => runTenantSamlDisconnectDrill(tenantId, idpEntityId),
    onSuccess: async (data) => {
      toast.success(`断连演练 ${data.result}（${data.latencyMs}ms）`)
      await queryClient.invalidateQueries({
        queryKey: adminQueryKeys.tenantSamlIdpHealth(tenantId),
      })
    },
    onError: (error) => toast.error(formatAdminApiError(error, '演练失败')),
  })

  const healthyCount = query.data?.items.filter((i) => i.healthy).length ?? 0
  const totalCount = query.data?.items.length ?? 0

  return (
    <AdminPanel>
      <AdminPanelHeader
        icon={ActivityIcon}
        title="SAML IdP 健康"
        description="SSO 可达与 metadata 新鲜度（Phase 16-1）"
        action={
          canWrite ? (
            <Button
              disabled={drillMutation.isPending}
              size="sm"
              type="button"
              variant="outline"
              onClick={() => drillMutation.mutate(undefined)}
            >
              <PlayIcon className="mr-1 size-4" />
              断连演练
            </Button>
          ) : null
        }
      />
      {query.isLoading ? (
        <AdminTableSkeleton rows={2} columns={2} />
      ) : query.isError ? (
        <AdminEmptyState
          icon={ActivityIcon}
          message="无法加载 IdP 健康状态"
          onRetry={() => void query.refetch()}
          isRetrying={query.isFetching}
        />
      ) : (
        <div className="space-y-3 px-4 pb-4">
          <div className="grid gap-3 sm:grid-cols-2">
            <AdminMetricCard label="健康 IdP" value={`${healthyCount}/${totalCount}`} />
            <AdminMetricCard
              label="联邦/主 IdP"
              value={String(totalCount)}
            />
          </div>
          {!query.data?.items.length ? (
            <p className="text-sm text-muted-foreground">未配置 SAML IdP</p>
          ) : (
            <ul className="divide-y divide-border/60 text-sm">
              {query.data.items.map((item) => (
                <li key={`${item.source}-${item.idpEntityId}`} className="flex flex-wrap items-center justify-between gap-2 py-2">
                  <span className="font-mono text-xs break-all">{item.idpEntityId}</span>
                  <span className={item.healthy ? 'text-emerald-400' : 'text-destructive'}>
                    {item.healthy ? '健康' : '异常'}
                  </span>
                  {canWrite ? (
                    <Button
                      disabled={drillMutation.isPending}
                      size="sm"
                      type="button"
                      variant="ghost"
                      onClick={() => drillMutation.mutate(item.idpEntityId)}
                    >
                      演练
                    </Button>
                  ) : null}
                </li>
              ))}
            </ul>
          )}
        </div>
      )}
    </AdminPanel>
  )
}
