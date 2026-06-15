export function buildAuditUsersLink(
  actorEmail: string,
  targetTenantId?: string | null,
): string {
  const params = new URLSearchParams({ q: actorEmail })
  if (targetTenantId?.trim()) {
    params.set('tenantId', targetTenantId.trim())
  }
  return `/users?${params.toString()}`
}
