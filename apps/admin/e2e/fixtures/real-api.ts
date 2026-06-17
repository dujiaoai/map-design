const DEFAULT_SAAS_API_HOST = 'http://localhost:8082'

import { expect, type Page } from '@playwright/test'

export const E2E_REAL_API_CREDENTIALS = {
  email: process.env.E2E_EMAIL ?? 'admin@demo.local',
  password: process.env.E2E_PASSWORD ?? 'password',
  tenantSlug: process.env.E2E_TENANT ?? 'demo',
}

function resolveSaasApiHost() {
  return (
    process.env.E2E_SAAS_API_HOST ??
    process.env.VITE_SAAS_API_HOST ??
    DEFAULT_SAAS_API_HOST
  ).replace(/\/$/, '')
}

/** 直连 saas-api（非 Vite 代理），用于 Playwright 启动前探活 */
export async function probeSaasApi(timeoutMs = 4000): Promise<boolean> {
  const controller = new AbortController()
  const timer = setTimeout(() => controller.abort(), timeoutMs)
  try {
    const res = await fetch(`${resolveSaasApiHost()}/actuator/health`, {
      signal: controller.signal,
    })
    return res.ok
  } catch {
    return false
  } finally {
    clearTimeout(timer)
  }
}

/** 可选：确认 demo 种子账号可登录（避免仅有 health 但无 seed） */
export async function probeDemoAdminLogin(timeoutMs = 8000): Promise<boolean> {
  const controller = new AbortController()
  const timer = setTimeout(() => controller.abort(), timeoutMs)
  try {
    const res = await fetch(`${resolveSaasApiHost()}/v1/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        email: E2E_REAL_API_CREDENTIALS.email,
        password: E2E_REAL_API_CREDENTIALS.password,
        tenantId: E2E_REAL_API_CREDENTIALS.tenantSlug,
      }),
      signal: controller.signal,
    })
    if (!res.ok) return false
    const body = (await res.json()) as { accessToken?: string }
    return Boolean(body.accessToken)
  } catch {
    return false
  } finally {
    clearTimeout(timer)
  }
}

export async function isRealApiE2eReady(): Promise<boolean> {
  if (!(await probeSaasApi())) return false
  return probeDemoAdminLogin()
}

export async function loginViaRealApi(page: Page) {
  await page.goto('/login')
  await expect(page.getByText('加载中…')).toBeHidden({ timeout: 45_000 })
  await expect(page.getByRole('textbox', { name: '邮箱' })).toBeVisible({ timeout: 15_000 })
  await page.getByRole('textbox', { name: '邮箱' }).fill(E2E_REAL_API_CREDENTIALS.email)
  await page.getByRole('textbox', { name: '密码' }).fill(E2E_REAL_API_CREDENTIALS.password)
  await page.getByLabel('租户 slug').fill(E2E_REAL_API_CREDENTIALS.tenantSlug)
  await page.getByRole('button', { name: '进入控制台' }).click()
  await expect(page).not.toHaveURL(/\/login/, { timeout: 30_000 })
  await expect(page.getByText('加载中…')).toBeHidden({ timeout: 45_000 })
}
