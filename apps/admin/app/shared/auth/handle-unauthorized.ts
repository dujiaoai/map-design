import { auth } from '~/shared/auth/client'
import { redirectToAdminLogin } from '~/shared/auth/redirect-to-admin-login'

/** 清会话并回到登录页。 */
export function handleAdminUnauthorized() {
  auth.clearSession()
  redirectToAdminLogin()
}
