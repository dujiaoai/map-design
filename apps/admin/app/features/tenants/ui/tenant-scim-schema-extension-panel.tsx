import { useQuery } from '@tanstack/react-query'
import { LayersIcon } from 'lucide-react'

import { fetchTenantScimSchemaExtension } from '~/entities/tenant/api'
import { adminQueryKeys } from '~/shared/lib/admin-query-keys'
import {
  AdminConfigRow,
  AdminEmptyState,
  AdminPanel,
  AdminPanelHeader,
} from '~/shared/ui/admin-page-shell'
import { AdminTableSkeleton } from '~/shared/ui/admin-table-skeleton'

export function TenantScimSchemaExtensionPanel({ tenantId }: { tenantId: string }) {
  const query = useQuery({
    queryKey: adminQueryKeys.tenantScimSchemaExtension(tenantId),
    queryFn: () => fetchTenantScimSchemaExtension(tenantId),
  })

  return (
    <AdminPanel>
      <AdminPanelHeader
        icon={LayersIcon}
        title="SCIM Schema Extension"
        description="Enterprise 扩展字段摘要（只读，Phase 13-2）"
      />
      {query.isLoading ? (
        <AdminTableSkeleton rows={2} columns={1} />
      ) : query.isError || !query.data ? (
        <AdminEmptyState
          icon={LayersIcon}
          message="无法加载 schema extension"
          onRetry={() => void query.refetch()}
          isRetrying={query.isFetching}
        />
      ) : (
        <div className="space-y-2 px-4 pb-4">
          <AdminConfigRow
            label="Enterprise 字段"
            value={query.data.enterpriseFields.join(', ') || '—'}
          />
          <AdminConfigRow
            label="自定义属性 JSON"
            value={query.data.configured ? query.data.attributesJson : '未配置'}
            mono
          />
        </div>
      )}
    </AdminPanel>
  )
}
