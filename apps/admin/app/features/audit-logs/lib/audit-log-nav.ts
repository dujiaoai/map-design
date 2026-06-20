import type { AdminPageBackLink } from '~/shared/ui/admin-page-shell'

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

export function buildAuditLogDetailHref(
  logId: string,
  listContext?: {
    tenantId?: string | null
    actorUserId?: string | null
  },
): string {
  const params = new URLSearchParams()
  if (listContext?.tenantId?.trim()) {
    params.set('tenantId', listContext.tenantId.trim())
  }
  if (listContext?.actorUserId?.trim()) {
    params.set('actorUserId', listContext.actorUserId.trim())
  }
  const query = params.toString()
  return query ? `/audit-logs/${logId}?${query}` : `/audit-logs/${logId}`
}

export function resolveAuditLogBackLink(searchParams: URLSearchParams): AdminPageBackLink {
  return {
    to: buildAuditLogsLink({
      tenantId: searchParams.get('tenantId'),
      actorUserId: searchParams.get('actorUserId'),
    }),
    label: '返回审计列表',
  }
}
