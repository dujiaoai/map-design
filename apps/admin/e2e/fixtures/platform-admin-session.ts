import type { Page } from '@playwright/test'

const STORAGE_PREFIX = 'saas-admin'

/** Playwright 用：平台运营会话（含概览读权限） */
export const E2E_PLATFORM_ADMIN_SESSION = {
  user: {
    id: 'e2e-platform-admin',
    email: 'e2e-admin@demo.local',
    name: 'E2E Platform Admin',
    roles: ['PLATFORM_ADMIN'] as const,
    permissions: ['admin:tenants:read', 'admin:users:read', 'admin:roles:read'],
  },
  tenant: {
    id: 'e2e-tenant-demo',
    name: 'Demo Tenant',
    slug: 'demo',
  },
}

export async function seedPlatformAdminSession(page: Page) {
  await page.addInitScript(
    ({ prefix, session, accessToken, refreshToken }) => {
      localStorage.setItem(`${prefix}:access-token`, accessToken)
      localStorage.setItem(`${prefix}:refresh-token`, refreshToken)
      localStorage.setItem(`${prefix}:session`, JSON.stringify(session))
    },
    {
      prefix: STORAGE_PREFIX,
      session: E2E_PLATFORM_ADMIN_SESSION,
      accessToken: 'e2e-access-token',
      refreshToken: 'e2e-refresh-token',
    },
  )
}

export async function mockAdminOverviewApis(page: Page) {
  await page.route('**/admin/ping', async (route) => {
    await route.fulfill({
      status: 200,
      contentType: 'application/json',
      body: JSON.stringify({
        status: 'ok',
        authenticated: true,
        platformAdmin: true,
      }),
    })
  })

  await page.route('**/admin/stats', async (route) => {
    await route.fulfill({
      status: 200,
      contentType: 'application/json',
      body: JSON.stringify({
        tenantCount: 3,
        userCount: 12,
        activeTenantCount: 2,
      }),
    })
  })
}
