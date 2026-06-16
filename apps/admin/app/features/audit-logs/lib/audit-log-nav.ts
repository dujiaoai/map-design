export function buildAuditLogsLink(filters?: {
  tenantId?: string | null
  actorUserId?: string | null
}): string {
  const params = new URLSearchParams()
  if (filters?.tenantId?.trim()) {
    params.set('tenantId', filters.tenantId.trim())
  }
  if (filters?.actorUserId?.trim()) {
    params.set('actorUserId', filters.actorUserId.trim())
  }
  const query = params.toString()
  return query ? `/audit-logs?${query}` : '/audit-logs'
}
