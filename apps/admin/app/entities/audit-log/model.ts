export interface AdminAuditLogEntry {
  id: string
  actorUserId: string | null
  actorEmail: string
  action: string
  resourceType: string
  resourceId: string | null
  targetTenantId: string | null
  crossTenant: boolean
  detail: string | null
  createdAt: number
}

export interface AdminAuditLogListResponse {
  logs: AdminAuditLogEntry[]
  total?: number
  page?: number
  size?: number
}

export interface AdminAuditWebhookConfig {
  enabled: boolean
  configured: boolean
  format: string
  deliveryMode: string
}
