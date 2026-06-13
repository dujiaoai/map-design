import { AuditLogsAdminPage } from '~/features/audit-logs/ui/audit-logs-admin-page'
import { requireAdminPermissions } from '~/shared/auth/require-admin-permissions'

import type { Route } from './+types/audit-logs'

export function meta(_args: Route.MetaArgs) {
  return [{ title: '审计日志 · 云眼运营后台' }]
}

export async function clientLoader(_args: Route.ClientLoaderArgs) {
  requireAdminPermissions(['admin:tenants:read'])
  return null
}

export default function AuditLogsRoute() {
  return <AuditLogsAdminPage />
}
