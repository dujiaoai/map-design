import { useQuery } from '@tanstack/react-query'
import { UsersIcon } from 'lucide-react'

import { fetchTenantScimGroupMappingRules } from '~/shared/api/admin-api'
import { adminQueryKeys } from '~/shared/lib/admin-query-keys'
import {
  AdminConfigRow,
  AdminEmptyState,
  AdminPanel,
  AdminPanelHeader,
} from '~/shared/ui/admin-page-shell'
import { AdminTableSkeleton } from '~/shared/ui/admin-table-skeleton'

export function TenantScimGroupMappingRulesPanel({ tenantId }: { tenantId: string }) {
  const query = useQuery({
    queryKey: adminQueryKeys.tenantScimGroupMappingRules(tenantId),
    queryFn: () => fetchTenantScimGroupMappingRules(tenantId),
  })

  return (
    <AdminPanel>
      <AdminPanelHeader
        icon={UsersIcon}
        title="SCIM Group 映射规则"
        description="外部组名 glob 模式 → 租户角色（Phase 14-2 只读）"
      />
      {query.isLoading ? (
        <AdminTableSkeleton rows={2} columns={1} />
      ) : query.isError ? (
        <AdminEmptyState
          icon={UsersIcon}
          message="无法加载映射规则"
          onRetry={() => void query.refetch()}
          isRetrying={query.isFetching}
        />
      ) : !query.data?.rules.length ? (
        <p className="px-4 pb-4 text-sm text-muted-foreground">暂无映射规则</p>
      ) : (
        <ul className="divide-y divide-border/60 px-4 pb-4">
          {query.data.rules.map((rule) => (
            <li key={rule.id} className="py-2 text-sm">
              <AdminConfigRow label="模式" value={rule.externalGroupPattern} mono />
              <AdminConfigRow label="角色" value={`${rule.roleName} (${rule.tenantRoleId})`} mono />
              <AdminConfigRow label="优先级" value={String(rule.priority)} mono />
            </li>
          ))}
        </ul>
      )}
    </AdminPanel>
  )
}
