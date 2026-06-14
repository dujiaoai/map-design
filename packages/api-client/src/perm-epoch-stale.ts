const PERM_EPOCH_STALE = 'perm_epoch_stale'

export function isPermEpochStaleProblem(body: unknown): boolean {
  if (!body || typeof body !== 'object') return false
  const record = body as Record<string, unknown>
  if (record.status !== 403) return false
  const type = record.type
  return typeof type === 'string' && type.includes(PERM_EPOCH_STALE)
}
