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
  await page.route('**/auth/refresh', async (route) => {
    if (route.request().method() !== 'POST') {
      await route.continue()
      return
    }
    await route.fulfill({
      status: 200,
      contentType: 'application/json',
      body: JSON.stringify({
        accessToken: 'e2e-access-token',
        refreshToken: 'e2e-refresh-token',
        expiresIn: 3600,
      }),
    })
  })

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
    const url = route.request().url()
    if (url.includes('/usage-anomalies')) {
      await route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify({
          anomalies: [
            {
              metric: 'auditEvents',
              currentValue: 50,
              sevenDayAverage: 5,
              ratio: 10,
              day: '2026-06-18',
            },
          ],
        }),
      })
      return
    }
    if (url.includes('/usage-trends')) {
      await route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify({
          days: [
            { date: '2026-06-12', newUsers: 1, auditEvents: 5, activeTenants: 2, billingApiCallsPerDay: 10, billingReconcileDiffsPerDay: 0 },
            { date: '2026-06-13', newUsers: 0, auditEvents: 3, activeTenants: 1, billingApiCallsPerDay: 4, billingReconcileDiffsPerDay: 1 },
            { date: '2026-06-14', newUsers: 2, auditEvents: 8, activeTenants: 2, billingApiCallsPerDay: 12, billingReconcileDiffsPerDay: 0 },
            { date: '2026-06-15', newUsers: 1, auditEvents: 4, activeTenants: 2, billingApiCallsPerDay: 6, billingReconcileDiffsPerDay: 0 },
            { date: '2026-06-16', newUsers: 0, auditEvents: 6, activeTenants: 3, billingApiCallsPerDay: 8, billingReconcileDiffsPerDay: 2 },
            { date: '2026-06-17', newUsers: 3, auditEvents: 2, activeTenants: 2, billingApiCallsPerDay: 5, billingReconcileDiffsPerDay: 0 },
            { date: '2026-06-18', newUsers: 1, auditEvents: 7, activeTenants: 2, billingApiCallsPerDay: 9, billingReconcileDiffsPerDay: 1 },
          ],
        }),
      })
      return
    }
    await route.fulfill({
      status: 200,
      contentType: 'application/json',
      body: JSON.stringify({
        tenantCount: 3,
        userCount: 12,
        activeTenantCount: 2,
        activeTenantsLast7Days: 2,
        newUsersLast7Days: 4,
        suspendedTenantCount: 0,
        trialActiveTenantCount: 1,
        trialExpiredTenantCount: 0,
        audit: {
          webhookEnabled: false,
          webhookConfigured: false,
          webhookFormat: 'jsonl',
          deliveryMode: 'csv_only',
          retentionDays: 365,
        },
      }),
    })
  })
}
