import { env } from './env'

/** 已配置 `VITE_API_URL` 时走 SaaS `/v1/auth/*` 与 `users/me` bootstrap */
export function isSaasAuthEnabled(): boolean {
  return Boolean(env.VITE_API_URL)
}
