import { redirect } from 'react-router'

import { AuditLogDetailPage } from '~/features/audit-logs/ui/audit-log-detail-page'
import { AUDIT_READ_PERMISSIONS } from '~/features/audit-logs/lib/audit-log-permissions'
import { requireAdminPermissions } from '~/shared/auth/require-admin-permissions'

import type { Route } from './+types/audit-logs.$logId'

export function meta(_args: Route.MetaArgs) {
  return [{ title: '审计详情 · 云眼运营后台' }]
}

export async function clientLoader({ params }: Route.ClientLoaderArgs) {
  requireAdminPermissions([...AUDIT_READ_PERMISSIONS])
  const logId = params.logId?.trim()
  if (!logId) {
    throw redirect('/audit-logs')
  }
  return { logId }
}

export default function AuditLogDetailRoute({ loaderData }: Route.ComponentProps) {
  return <AuditLogDetailPage logId={loaderData.logId} />
}
