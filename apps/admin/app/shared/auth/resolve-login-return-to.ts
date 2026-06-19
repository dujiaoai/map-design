/** 登录成功后安全回跳（仅允许站内相对路径）。 */
export function resolveAdminLoginReturnTo(returnTo: string | null | undefined): string | null {
  if (!returnTo?.trim()) return null
  const trimmed = returnTo.trim()
  if (!trimmed.startsWith('/') || trimmed.startsWith('//')) return null
  if (trimmed.startsWith('/login')) return null
  return trimmed
}
