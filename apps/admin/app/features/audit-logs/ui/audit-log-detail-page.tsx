import { useQuery } from '@tanstack/react-query'
import { useSearchParams } from 'react-router'

import { formatAuditActionLabel } from '~/features/audit-logs/lib/audit-log-labels'
import { resolveAuditLogBackLink } from '~/features/audit-logs/lib/audit-log-nav'
import { AuditLogDetailBody } from '~/features/audit-logs/ui/audit-log-detail-body'
import { fetchAdminAuditLog } from '~/shared/api/admin-api'
import { useAdminPermissions } from '~/shared/hooks/use-admin-permissions'
import { adminQueryKeys } from '~/shared/lib/admin-query-keys'
import { formatAdminApiError } from '~/shared/lib/format-admin-api-error'
import {
  AdminEmptyState,
  AdminPageBackButton,
  AdminPageHeader,
  AdminPanel,
} from '~/shared/ui/admin-page-shell'
import { AdminDetailSkeleton } from '~/shared/ui/admin-table-skeleton'

export function AuditLogDetailPage({ logId }: { logId: string }) {
  const { can } = useAdminPermissions()
  const canReadUsers = can('admin:users:read')
  const canReadTenants = can('admin:tenants:read')
  const [searchParams] = useSearchParams()
  const backLink = resolveAuditLogBackLink(searchParams)

  const query = useQuery({
    queryKey: adminQueryKeys.auditLog(logId),
    queryFn: () => fetchAdminAuditLog(logId),
    retry: false,
  })

  const log = query.data

  return (
    <div className="space-y-6 admin-stagger">
      <AdminPageBackButton backLink={backLink} />

      {query.isLoading ? (
        <AdminDetailSkeleton />
      ) : query.isError ? (
        <>
          <AdminPageHeader eyebrow="Operations" title="审计详情" description="加载失败" />
          <AdminPanel>
            <AdminEmptyState
              message={formatAdminApiError(query.error, '无法加载审计记录')}
              onRetry={() => void query.refetch()}
              isRetrying={query.isFetching}
            />
          </AdminPanel>
        </>
      ) : log ? (
        <>
          <AdminPageHeader
            eyebrow="Audit Trail"
            title={formatAuditActionLabel(log.action)}
            description={`${log.actorEmail} · ${log.action}`}
          />
          <AuditLogDetailBody
            log={log}
            canReadTenants={canReadTenants}
            canReadUsers={canReadUsers}
          />
        </>
      ) : null}
    </div>
  )
}
