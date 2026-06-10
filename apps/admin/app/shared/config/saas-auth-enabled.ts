import { env } from './env'

export function isSaasAuthEnabled(): boolean {
  return Boolean(env.VITE_API_URL)
}
