import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { CheckIcon, ShieldIcon } from 'lucide-react'

import {
  approveTenantSamlIdpRegistration,
  fetchTenantSamlIdpRegistrations,
} from '~/entities/tenant/api'
import { useAdminPermissions } from '~/shared/hooks/use-admin-permissions'
import { adminQueryKeys } from '~/shared/lib/admin-query-keys'
import { formatAdminApiError } from '~/shared/lib/format-admin-api-error'
import {
  AdminEmptyState,
  AdminPanel,
  AdminPanelHeader,
} from '~/shared/ui/admin-page-shell'
import { AdminTableSkeleton } from '~/shared/ui/admin-table-skeleton'
import { formatAdminDate } from '~/shared/ui/admin-status-badge'
import { Button, toast } from '@repo/ui'

export function TenantSamlIdpRegistrationsPanel({ tenantId }: { tenantId: string }) {
  const { can } = useAdminPermissions()
  const canWrite = can('admin:tenants:write')
  const queryClient = useQueryClient()

  const query = useQuery({
    queryKey: adminQueryKeys.tenantSamlIdpRegistrations(tenantId),
    queryFn: () => fetchTenantSamlIdpRegistrations(tenantId),
  })

  const approveMutation = useMutation({
    mutationFn: (registrationId: string) =>
      approveTenantSamlIdpRegistration(tenantId, registrationId),
    onSuccess: async () => {
      toast.success('IdP 注册已审批')
      await queryClient.invalidateQueries({
        queryKey: adminQueryKeys.tenantSamlIdpRegistrations(tenantId),
      })
    },
    onError: (error) => toast.error(formatAdminApiError(error, '审批失败')),
  })

  return (
    <AdminPanel>
      <AdminPanelHeader
        icon={ShieldIcon}
        title="IdP 自助注册"
        description="待审批的 IdP entityId 注册（Phase 13-1）"
      />
      {query.isLoading ? (
        <AdminTableSkeleton rows={2} columns={1} />
      ) : query.isError ? (
        <AdminEmptyState
          icon={ShieldIcon}
          message="无法加载 IdP 注册列表"
          onRetry={() => void query.refetch()}
          isRetrying={query.isFetching}
        />
      ) : !query.data?.registrations.length ? (
        <p className="px-4 pb-4 text-sm text-muted-foreground">暂无待审批注册</p>
      ) : (
        <ul className="divide-y divide-border/60 px-4 pb-4">
          {query.data.registrations.map((reg) => (
            <li key={reg.id} className="flex flex-wrap items-center justify-between gap-2 py-3 text-sm">
              <span className="font-mono text-xs break-all">{reg.idpEntityId ?? '—'}</span>
              <span className="text-muted-foreground">{formatAdminDate(reg.createdAt)}</span>
              {canWrite ? (
                <Button
                  disabled={approveMutation.isPending}
                  size="sm"
                  type="button"
                  variant="outline"
                  onClick={() => approveMutation.mutate(reg.id)}
                >
                  <CheckIcon className="mr-1 size-4" />
                  审批
                </Button>
              ) : null}
            </li>
          ))}
        </ul>
      )}
    </AdminPanel>
  )
}
