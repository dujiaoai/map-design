import { Badge, Button, toast } from '@repo/ui'
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { CopyIcon, UsersIcon } from 'lucide-react'
import { useState } from 'react'

import type { AdminTenantScimProvisioning } from '~/entities/tenant/model'
import { fetchTenantScimSyncEventSummary } from '~/entities/tenant/api'
import { generateTenantScimToken } from '~/shared/api/admin-api'
import { adminQueryKeys } from '~/shared/lib/admin-query-keys'
import { formatAdminApiError } from '~/shared/lib/format-admin-api-error'
import { formatAdminDate } from '~/shared/ui/admin-status-badge'
import { AdminConfigRow, AdminPanel, AdminPanelHeader } from '~/shared/ui/admin-page-shell'

export function TenantScimStatusCard({
  tenantId,
  status,
  readOnly,
}: {
  tenantId: string
  status: AdminTenantScimProvisioning
  readOnly: boolean
}) {
  const queryClient = useQueryClient()
  const [revealedToken, setRevealedToken] = useState<string | null>(null)

  const syncEventsQuery = useQuery({
    queryKey: adminQueryKeys.tenantScimSyncEvents(tenantId),
    queryFn: () => fetchTenantScimSyncEventSummary(tenantId),
  })

  const generateMutation = useMutation({
    mutationFn: () => generateTenantScimToken(tenantId),
    onSuccess: (data) => {
      setRevealedToken(data.token)
      toast.success('SCIM token 已生成（仅展示一次）')
      void queryClient.invalidateQueries({ queryKey: adminQueryKeys.tenantScimProvisioning(tenantId) })
    },
    onError: (error) => toast.error(formatAdminApiError(error)),
  })

  return (
    <AdminPanel>
      <AdminPanelHeader
        icon={UsersIcon}
        title="SCIM Directory Sync"
        description="目录同步 Users CRUD（Phase 11-2）"
        actions={
          syncEventsQuery.data && syncEventsQuery.data.tenantPendingCount > 0 ? (
            <Badge variant="destructive">
              冲突 {syncEventsQuery.data.tenantPendingCount}
            </Badge>
          ) : null
        }
      />
      <AdminConfigRow
        label="Provisioning"
        value={
          <Badge variant={status.enabled ? 'default' : 'secondary'}>
            {status.enabled ? '已启用' : '未启用'}
          </Badge>
        }
      />
      <AdminConfigRow
        label="Bearer Token"
        value={status.tokenConfigured ? '已配置' : '未配置'}
      />
      <AdminConfigRow label="Users Endpoint" value={status.usersEndpointUrl} mono />
      <AdminConfigRow
        label="最后 Sync"
        value={status.lastSyncAt ? formatAdminDate(status.lastSyncAt) : '尚无同步记录'}
      />
      {revealedToken ? (
        <AdminConfigRow
          label="新生成 Token"
          value={
            <code className="break-all text-xs">{revealedToken}</code>
          }
          mono
        />
      ) : null}
      {!readOnly ? (
        <Button
          disabled={generateMutation.isPending}
          size="sm"
          variant="outline"
          onClick={() => generateMutation.mutate()}
        >
          <CopyIcon className="mr-2 size-4" />
          生成 SCIM Token
        </Button>
      ) : null}
    </AdminPanel>
  )
}
