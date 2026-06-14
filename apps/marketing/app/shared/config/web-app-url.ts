import { env } from '~/shared/config/env'

const DEFAULT_WEB_APP_URL = 'http://localhost:5175'

export function resolveWebAppUrl(): string {
  return env.VITE_WEB_APP_URL ?? DEFAULT_WEB_APP_URL
}

export function webRegisterPersonalUrl(): string {
  return `${resolveWebAppUrl()}/register?mode=personal`
}

export function webLoginUrl(): string {
  return `${resolveWebAppUrl()}/login`
}
