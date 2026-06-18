import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { GlobeIcon, PlusIcon, TrashIcon } from 'lucide-react'
import { useState } from 'react'

import {
  addTenantSamlIdpFederation,
  fetchTenantSamlIdpFederation,
  removeTenantSamlIdpFederation,
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
import { Button, Input, toast } from '@repo/ui'

export function TenantSamlIdpFederationPanel({ tenantId }: { tenantId: string }) {
  const { can } = useAdminPermissions()
  const canWrite = can('admin:tenants:write')
  const queryClient = useQueryClient()
  const [entityId, setEntityId] = useState('')
  const [ssoUrl, setSsoUrl] = useState('')

  const query = useQuery({
    queryKey: adminQueryKeys.tenantSamlIdpFederation(tenantId),
    queryFn: () => fetchTenantSamlIdpFederation(tenantId),
  })

  const addMutation = useMutation({
    mutationFn: () =>
      addTenantSamlIdpFederation(tenantId, {
        idpEntityId: entityId.trim(),
        ssoUrl: ssoUrl.trim(),
        priority: query.data?.items.length ?? 0,
        enabled: true,
      }),
    onSuccess: async () => {
      toast.success('联邦 IdP 已添加')
      setEntityId('')
      setSsoUrl('')
      await queryClient.invalidateQueries({
        queryKey: adminQueryKeys.tenantSamlIdpFederation(tenantId),
      })
    },
    onError: (error) => toast.error(formatAdminApiError(error, '添加失败')),
  })

  const removeMutation = useMutation({
    mutationFn: (federationId: string) => removeTenantSamlIdpFederation(tenantId, federationId),
    onSuccess: async () => {
      toast.success('联邦 IdP 已移除')
      await queryClient.invalidateQueries({
        queryKey: adminQueryKeys.tenantSamlIdpFederation(tenantId),
      })
    },
    onError: (error) => toast.error(formatAdminApiError(error, '移除失败')),
  })

  return (
    <AdminPanel>
      <AdminPanelHeader
        icon={GlobeIcon}
        title="SAML IdP 联邦"
        description="多 IdP 按 priority 回退（Phase 15-1）"
      />
      {query.isLoading ? (
        <AdminTableSkeleton rows={2} columns={1} />
      ) : query.isError ? (
        <AdminEmptyState
          icon={GlobeIcon}
          message="无法加载联邦 IdP 列表"
          onRetry={() => void query.refetch()}
          isRetrying={query.isFetching}
        />
      ) : (
        <div className="space-y-3 px-4 pb-4">
          {!query.data?.items.length ? (
            <p className="text-sm text-muted-foreground">暂无联邦 IdP</p>
          ) : (
            <ul className="divide-y divide-border/60">
              {query.data.items.map((item) => (
                <li
                  key={item.id}
                  className="flex flex-wrap items-center justify-between gap-2 py-2 text-sm"
                >
                  <span className="font-mono text-xs break-all">{item.idpEntityId}</span>
                  <span className="text-muted-foreground">priority {item.priority}</span>
                  {canWrite ? (
                    <Button
                      disabled={removeMutation.isPending}
                      size="sm"
                      type="button"
                      variant="ghost"
                      onClick={() => removeMutation.mutate(item.id)}
                    >
                      <TrashIcon className="size-4" />
                    </Button>
                  ) : null}
                </li>
              ))}
            </ul>
          )}
          {canWrite ? (
            <div className="flex flex-wrap gap-2">
              <Input
                placeholder="IdP Entity ID"
                value={entityId}
                onChange={(e) => setEntityId(e.target.value)}
              />
              <Input
                placeholder="SSO URL"
                value={ssoUrl}
                onChange={(e) => setSsoUrl(e.target.value)}
              />
              <Button
                disabled={addMutation.isPending || !entityId.trim() || !ssoUrl.trim()}
                size="sm"
                type="button"
                onClick={() => addMutation.mutate()}
              >
                <PlusIcon className="mr-1 size-4" />
                添加
              </Button>
            </div>
          ) : null}
        </div>
      )}
    </AdminPanel>
  )
}
