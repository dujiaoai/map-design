import { buildAdminListQuery, type AdminListQuery } from '~/shared/lib/admin-list-query'
import { api } from '~/shared/api/client'

import type {
  AdminAuditLogListResponse,
  AdminAuditWebhookConfig,
  AdminAuditWebhookDeadLetterListResponse,
  AdminAuditWebhookDeadLetterReplayResponse,
} from './model'

export function fetchAdminAuditLogs(params?: AdminListQuery) {
  return api.get<AdminAuditLogListResponse>(`/admin/audit-logs${buildAdminListQuery(params)}`)
}

export function fetchAdminAuditWebhookConfig() {
  return api.get<AdminAuditWebhookConfig>('/admin/audit-logs/webhook-config')
}

export function fetchAdminAuditWebhookDeadLetters(params?: AdminListQuery) {
  return api.get<AdminAuditWebhookDeadLetterListResponse>(
    `/admin/audit-logs/webhook-dead-letters${buildAdminListQuery(params)}`,
  )
}

export function replayAdminAuditWebhookDeadLetter(id: string) {
  return api.post<AdminAuditWebhookDeadLetterReplayResponse>(
    `/admin/audit-logs/webhook-dead-letters/${id}/replay`,
  )
}

export function deleteAdminAuditWebhookDeadLetter(id: string) {
  return api.delete<void>(`/admin/audit-logs/webhook-dead-letters/${id}`)
}
