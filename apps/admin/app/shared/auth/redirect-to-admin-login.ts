/** 401 / refresh 失败后跳回登录页（保留 returnTo）。 */
export function redirectToAdminLogin() {
  if (typeof window === 'undefined') return

  const path = window.location.pathname
  if (path.startsWith('/login')) return

  const returnTo = `${window.location.pathname}${window.location.search}`
  window.location.assign(`/login?returnTo=${encodeURIComponent(returnTo)}`)
}
