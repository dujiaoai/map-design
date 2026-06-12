import { auth } from '~/shared/auth/client'
import { loadRememberLogin, saveRememberLogin } from '~/shared/lib/remember-login'

export type SwitchTenantResult = 'switched' | 'redirect-login'

/** 切换租户：使用目标 slug 重新登录（ADR-0004） */
export async function switchTenantBySlug(targetSlug: string): Promise<SwitchTenantResult> {
  const normalizedSlug = targetSlug.trim()
  if (!normalizedSlug) return 'redirect-login'

  const session = auth.getSession()
  if (session?.tenant?.slug === normalizedSlug) {
    return 'switched'
  }

  const remembered = loadRememberLogin()
  const email = remembered?.email ?? session?.user.email

  if (remembered?.password && email) {
    try {
      await auth.login({
        email,
        password: remembered.password,
        tenantId: normalizedSlug,
      })
      saveRememberLogin(email, remembered.password, normalizedSlug)
      return 'switched'
    } catch {
      // 凭据失效时回退到登录页
    }
  }

  await auth.logout()
  return 'redirect-login'
}
