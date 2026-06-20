import { buildAdminListQuery, type AdminListQuery } from '~/shared/lib/admin-list-query'
import { api } from '~/shared/api/client'

import type {
  AdminAuditLogEntry,
  AdminAuditLogListResponse,
  AdminAuditWebhookConfig,
  AdminAuditWebhookSla,
  AdminAuditWebhookDeadLetterListResponse,
  AdminAuditWebhookDeadLetterReplayResponse,
  AdminAuditWebhookArchiveSummary,
} from './model'

export function fetchAdminAuditLogs(params?: AdminListQuery) {
  return api.get<AdminAuditLogListResponse>(`/admin/audit-logs${buildAdminListQuery(params)}`)
}

export function fetchAdminAuditLog(logId: string) {
  return api.get<AdminAuditLogEntry>(`/admin/audit-logs/${logId}`)
}

export function fetchAdminAuditWebhookConfig() {
  return api.get<AdminAuditWebhookConfig>('/admin/audit-logs/webhook-config')
}

export function fetchAdminAuditWebhookSla() {
  return api.get<AdminAuditWebhookSla>('/admin/audit-logs/webhook-sla')
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

export function fetchAdminAuditWebhookArchiveSummary() {
  return api.get<AdminAuditWebhookArchiveSummary>('/admin/audit-logs/webhook-archive-summary')
}
