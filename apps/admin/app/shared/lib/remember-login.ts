const STORAGE_KEY = 'saas-admin:remember-login'

export interface RememberLoginData {
  email: string
  password: string
  tenantSlug?: string
}

export function loadRememberLogin(): RememberLoginData | null {
  if (typeof window === 'undefined') return null
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY)
    if (!raw) return null
    const parsed = JSON.parse(raw) as RememberLoginData
    if (!parsed.email || !parsed.password) return null
    return parsed
  } catch {
    return null
  }
}

export function saveRememberLogin(email: string, password: string, tenantSlug?: string) {
  if (typeof window === 'undefined') return
  const payload: RememberLoginData = { email, password, tenantSlug }
  window.localStorage.setItem(STORAGE_KEY, JSON.stringify(payload))
}

export function clearRememberLogin() {
  if (typeof window === 'undefined') return
  window.localStorage.removeItem(STORAGE_KEY)
}
