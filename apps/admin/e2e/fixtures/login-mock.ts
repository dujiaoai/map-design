import type { Page } from '@playwright/test'

/** Playwright mock：POST /auth/login 返回平台运营会话 */
export async function mockAdminLoginApi(page: Page) {
  await page.route('**/auth/login', async (route) => {
    if (route.request().method() !== 'POST') {
      await route.continue()
      return
    }
    await route.fulfill({
      status: 200,
      contentType: 'application/json',
      body: JSON.stringify({
        accessToken: 'e2e-login-access-token',
        refreshToken: 'e2e-login-refresh-token',
        expiresIn: 3600,
        user: {
          id: 'e2e-login-user-id',
          email: 'e2e-login@demo.local',
          name: 'E2E Login User',
          roles: ['PLATFORM_ADMIN'],
          permissions: ['admin:tenants:read', 'admin:users:read', 'admin:roles:read'],
          tenant: {
            id: 'e2e-tenant-demo',
            name: 'Demo Tenant',
            slug: 'demo',
          },
        },
      }),
    })
  })
}
