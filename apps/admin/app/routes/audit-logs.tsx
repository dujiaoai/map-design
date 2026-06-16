import { AuditLogsAdminPage } from '~/features/audit-logs/ui/audit-logs-admin-page'
import { AUDIT_READ_PERMISSIONS } from '~/features/audit-logs/lib/audit-log-permissions'
import { requireAdminPermissions } from '~/shared/auth/require-admin-permissions'

import type { Route } from './+types/audit-logs'

export function meta(_args: Route.MetaArgs) {
  return [{ title: '审计日志 · 云眼运营后台' }]
}

export async function clientLoader(_args: Route.ClientLoaderArgs) {
  requireAdminPermissions([...AUDIT_READ_PERMISSIONS])
  return null
}

export default function AuditLogsRoute() {
  return <AuditLogsAdminPage />
}
