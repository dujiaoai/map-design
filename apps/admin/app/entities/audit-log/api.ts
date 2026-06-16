import { buildAdminListQuery, type AdminListQuery } from '~/shared/api/admin-list-query'
import { api } from '~/shared/api/client'

import type { AdminAuditLogListResponse } from './model'

export function fetchAdminAuditLogs(params?: AdminListQuery) {
  return api.get<AdminAuditLogListResponse>(`/admin/audit-logs${buildAdminListQuery(params)}`)
}
