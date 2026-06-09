import { auth } from '~/shared/auth/instance'
import { loadRememberLogin, saveRememberLogin } from '~/shared/lib/remember-login'
import { bootstrapAuthenticatedApp } from '~/shared/session/bootstrap-authenticated-app'
import { invalidateSessionQueries } from '~/shared/queries/invalidate-session-queries'

export type SwitchTenantResult = 'switched' | 'redirect-login'

function resolveLoginEmail(rememberedUsername: string, sessionEmail?: string): string | null {
  if (rememberedUsername.includes('@')) return rememberedUsername
  if (sessionEmail) return sessionEmail
  return rememberedUsername || null
}

/** 切换租户：使用目标 slug 重新登录（ADR-0004） */
export async function switchTenantBySlug(targetSlug: string): Promise<SwitchTenantResult> {
  const normalizedSlug = targetSlug.trim()
  if (!normalizedSlug) return 'redirect-login'

  const session = auth.getSession()
  if (session?.tenant?.slug === normalizedSlug) {
    return 'switched'
  }

  const remembered = loadRememberLogin()
  const email = remembered
    ? resolveLoginEmail(remembered.username, session?.user.email)
    : session?.user.email

  if (remembered?.password && email) {
    try {
      await auth.login({
        email,
        password: remembered.password,
        tenantId: normalizedSlug,
      })
      saveRememberLogin(email, remembered.password, normalizedSlug)
      await invalidateSessionQueries()
      await bootstrapAuthenticatedApp()
      return 'switched'
    } catch {
      // 凭据失效时回退到登录页
    }
  }

  await auth.logout()
  return 'redirect-login'
}
