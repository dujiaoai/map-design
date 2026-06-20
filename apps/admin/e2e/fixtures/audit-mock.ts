import type { Page } from '@playwright/test'

import { E2E_PLATFORM_ADMIN_SESSION } from './platform-admin-session'

/** 审计页 E2E：读 + 导出 */
export const E2E_AUDIT_SESSION = {
  ...E2E_PLATFORM_ADMIN_SESSION,
  user: {
    ...E2E_PLATFORM_ADMIN_SESSION.user,
    permissions: [
      'admin:tenants:read',
      'admin:users:read',
      'admin:audit:read',
      'admin:audit:export',
    ],
  },
}

const E2E_AUDIT_LOGS = {
  logs: [
    {
      id: 'e2e-audit-1',
      actorUserId: 'e2e-actor-1',
      actorEmail: 'admin@demo.local',
      action: 'tenant.update',
      resourceType: 'tenant',
      resourceId: 'e2e-tenant-demo',
      targetTenantId: 'e2e-tenant-demo',
      crossTenant: false,
      detail: '{"name":"Demo Tenant"}',
      createdAt: 1_700_000_000_000,
    },
    {
      id: 'e2e-audit-2',
      actorUserId: 'e2e-actor-1',
      actorEmail: 'admin@demo.local',
      action: 'billing.adjust',
      resourceType: 'billing_wallet',
      resourceId: 'wallet-1',
      targetTenantId: 'e2e-tenant-demo',
      crossTenant: true,
      detail: 'manual adjust +100',
      createdAt: 1_700_000_100_000,
    },
  ],
  total: 2,
  page: 1,
  size: 20,
}

const E2E_TENANTS = {
  tenants: [
    {
      id: 'e2e-tenant-demo',
      name: 'Demo Tenant',
      slug: 'demo',
      plan: 'pro',
      status: 'active',
      createdAt: 1_700_000_000_000,
    },
  ],
  total: 1,
  page: 1,
  size: 20,
}

export async function seedAuditSession(page: Page) {
  await page.addInitScript(
    ({ prefix, session, accessToken, refreshToken }) => {
      localStorage.setItem(`${prefix}:access-token`, accessToken)
      localStorage.setItem(`${prefix}:refresh-token`, refreshToken)
      localStorage.setItem(`${prefix}:session`, JSON.stringify(session))
    },
    {
      prefix: 'saas-admin',
      session: E2E_AUDIT_SESSION,
      accessToken: 'e2e-audit-access-token',
      refreshToken: 'e2e-audit-refresh-token',
    },
  )
}

export async function mockAuditPageApis(page: Page) {
  await page.route('**/auth/refresh', async (route) => {
    if (route.request().method() !== 'POST') {
      await route.continue()
      return
    }
    await route.fulfill({
      status: 200,
      contentType: 'application/json',
      body: JSON.stringify({
        accessToken: 'e2e-audit-access-token',
        refreshToken: 'e2e-audit-refresh-token',
        expiresIn: 3600,
      }),
    })
  })

  await page.route(/\/v1\/admin\/audit-logs/, async (route) => {
    const method = route.request().method()
    const url = route.request().url()
    const pathname = new URL(url).pathname

    if (method === 'GET' && url.includes('/export')) {
      await route.fulfill({
        status: 200,
        contentType: 'text/csv',
        body: 'id,action,actorEmail\ne2e-audit-1,tenant.update,admin@demo.local\n',
      })
      return
    }

    const singleLogMatch = pathname.match(/^\/v1\/admin\/audit-logs\/([^/]+)$/)
    if (method === 'GET' && singleLogMatch) {
      const logId = singleLogMatch[1]
      const log = E2E_AUDIT_LOGS.logs.find((item) => item.id === logId)
      if (log) {
        await route.fulfill({
          status: 200,
          contentType: 'application/json',
          body: JSON.stringify(log),
        })
        return
      }
      await route.fulfill({
        status: 404,
        contentType: 'application/json',
        body: JSON.stringify({ message: 'Audit log not found' }),
      })
      return
    }

    if (method === 'GET' && pathname === '/v1/admin/audit-logs') {
      await route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify(E2E_AUDIT_LOGS),
      })
      return
    }

    await route.continue()
  })

  await page.route(/\/v1\/admin\/tenants(\?|$)/, async (route) => {
    if (route.request().method() !== 'GET') {
      await route.continue()
      return
    }
    const path = new URL(route.request().url()).pathname
    if (path !== '/v1/admin/tenants') {
      await route.continue()
      return
    }
    await route.fulfill({
      status: 200,
      contentType: 'application/json',
      body: JSON.stringify(E2E_TENANTS),
    })
  })

  await page.route(/\/v1\/admin\/audit-logs\/webhook-archive-summary/, async (route) => {
    await route.fulfill({
      status: 200,
      contentType: 'application/json',
      body: JSON.stringify({
        totalArchived: 12,
        byRegion: [
          { region: 'us-east-1', count: 8 },
          { region: 'eu-west-1', count: 4 },
        ],
      }),
    })
  })

  await page.route(/\/v1\/admin\/audit-logs\/webhook-sla\/self-heal-status/, async (route) => {
    await route.fulfill({
      status: 200,
      contentType: 'application/json',
      body: JSON.stringify({
        degradedTargetCount: 1,
        eligibleForSelfHealCount: 1,
        deliveryRatePercent: 96.5,
        pendingDeadLetters: 1,
      }),
    })
  })

  await page.route(/\/v1\/admin\/stats\/finops\/budget-status/, async (route) => {
    await route.fulfill({
      status: 200,
      contentType: 'application/json',
      body: JSON.stringify({
        monthlyBudgetUsd: 1000,
        estimatedMonthlyCostUsd: 920,
        utilizationPercent: 92,
        alert: true,
        overBudget: false,
        throttleActive: false,
      }),
    })
  })

  await page.route(/\/v1\/admin\/stats\/finops/, async (route) => {
    await route.fulfill({
      status: 200,
      contentType: 'application/json',
      body: JSON.stringify({
        totalEstimatedMonthlyCostUsd: 120.5,
        billingApiCostUsd: 50,
        seatCostUsd: 60,
        storageCostUsd: 30.5,
        topConsumers: [],
      }),
    })
  })

  await page.route(/\/v1\/admin\/audit-logs\/webhook-sla/, async (route) => {
    await route.fulfill({
      status: 200,
      contentType: 'application/json',
      body: JSON.stringify({
        windowDays: 7,
        deliveryRatePercent: 96.5,
        avgLatencyMs: 120,
        pendingDeadLetters: 1,
        deadLetterCount: 2,
      }),
    })
  })

  await page.route(/\/v1\/admin\/audit-logs\/webhook-config/, async (route) => {
    await route.fulfill({
      status: 200,
      contentType: 'application/json',
      body: JSON.stringify({
        enabled: false,
        configured: false,
        format: 'jsonl',
        deliveryMode: 'csv_only',
        signatureEnabled: false,
      }),
    })
  })

  await page.route(/\/v1\/admin\/audit-logs\/webhook-targets/, async (route) => {
    await route.fulfill({
      status: 200,
      contentType: 'application/json',
      body: JSON.stringify({
        primaryWebhookUrl: '',
        targets: [
          {
            id: 'e2e-target-1',
            url: 'https://siem.example/hook',
            format: 'jsonl',
            enabled: true,
            priority: 1,
            createdAt: 1_700_000_000_000,
          },
        ],
      }),
    })
  })

  await page.route(/\/v1\/admin\/audit-logs\/webhook-dead-letters/, async (route) => {
    const method = route.request().method()
    const url = route.request().url()
    if (method === 'GET') {
      await route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify({
          items: [
            {
              id: 'e2e-dead-letter-1',
              logId: 'e2e-audit-1',
              attempts: 2,
              lastError: 'HTTP delivery failed',
              createdAt: 1_700_000_200_000,
              updatedAt: 1_700_000_300_000,
            },
          ],
          total: 1,
          page: 1,
          size: 10,
        }),
      })
      return
    }
    if (method === 'POST' && url.includes('/replay')) {
      await route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify({ id: 'e2e-dead-letter-1', success: true, message: 'Delivered' }),
      })
      return
    }
    if (method === 'DELETE') {
      await route.fulfill({ status: 204, body: '' })
      return
    }
    await route.continue()
  })
}
