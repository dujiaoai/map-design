import Cookies from 'js-cookie'

import { decrypt, encrypt } from '~/shared/lib/jsencrypt'

const COOKIE_EXPIRES_DAYS = 30

export interface RememberLoginData {
  username: string
  password: string
  rememberMe: boolean
}

export function loadRememberLogin(): RememberLoginData | null {
  const rememberMe = Cookies.get('rememberMe')
  if (!rememberMe) return null

  const username = Cookies.get('username') ?? ''
  const encryptedPassword = Cookies.get('password')
  const password =
    encryptedPassword === undefined ? '' : (decrypt(encryptedPassword) || '')

  return {
    username,
    password,
    rememberMe: Boolean(rememberMe),
  }
}

export function saveRememberLogin(username: string, password: string): void {
  Cookies.set('username', username, { expires: COOKIE_EXPIRES_DAYS })
  const encryptedPassword = encrypt(password)
  if (encryptedPassword) {
    Cookies.set('password', encryptedPassword, { expires: COOKIE_EXPIRES_DAYS })
  }
  Cookies.set('rememberMe', 'true', { expires: COOKIE_EXPIRES_DAYS })
}

export function clearRememberLogin(): void {
  Cookies.remove('username')
  Cookies.remove('password')
  Cookies.remove('rememberMe')
}
