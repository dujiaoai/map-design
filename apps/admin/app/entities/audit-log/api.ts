import { buildAdminListQuery, type AdminListQuery } from '~/shared/lib/admin-list-query'
import { api } from '~/shared/api/client'

import type { AdminAuditLogListResponse, AdminAuditWebhookConfig } from './model'

export function fetchAdminAuditLogs(params?: AdminListQuery) {
  return api.get<AdminAuditLogListResponse>(`/admin/audit-logs${buildAdminListQuery(params)}`)
}

export function fetchAdminAuditWebhookConfig() {
  return api.get<AdminAuditWebhookConfig>('/admin/audit-logs/webhook-config')
}
