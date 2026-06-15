export function formatAdminShellTitle(baseTitle: string, detail?: string | null) {
  const trimmed = detail?.trim()
  if (!trimmed) return baseTitle
  return `${baseTitle} · ${trimmed}`
}
