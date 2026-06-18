import type { Page } from '@playwright/test'

import { E2E_PLATFORM_ADMIN_SESSION, mockAdminOverviewApis } from './platform-admin-session'

const now = Date.now()

export const E2E_TENANTS_LIST = {
  tenants: [
    {
      id: 'e2e-tenant-active',
      name: 'Active Corp',
      slug: 'active-corp',
      plan: 'pro',
      status: 'active',
      trialEndsAt: null,
      onboardingPhase: 'active',
      createdAt: 1_700_000_000_000,
    },
    {
      id: 'e2e-tenant-trial',
      name: 'Trial Startup',
      slug: 'trial-startup',
      plan: 'trial',
      status: 'active',
      trialEndsAt: now + 86_400_000,
      onboardingPhase: 'trial',
      createdAt: 1_700_100_000_000,
    },
    {
      id: 'e2e-tenant-expired',
      name: 'Expired Trial Co',
      slug: 'expired-trial',
      plan: 'trial',
      status: 'active',
      trialEndsAt: now - 86_400_000,
      onboardingPhase: 'trial_expired',
      createdAt: 1_700_200_000_000,
    },
    {
      id: 'e2e-tenant-suspended',
      name: 'Suspended Org',
      slug: 'suspended-org',
      plan: 'starter',
      status: 'suspended',
      trialEndsAt: null,
      onboardingPhase: 'suspended',
      createdAt: 1_700_300_000_000,
    },
  ],
  total: 4,
  page: 1,
  size: 20,
}

export async function seedTenantsSession(page: Page) {
  await page.addInitScript(
    ({ prefix, session, accessToken, refreshToken }) => {
      localStorage.setItem(`${prefix}:access-token`, accessToken)
      localStorage.setItem(`${prefix}:refresh-token`, refreshToken)
      localStorage.setItem(`${prefix}:session`, JSON.stringify(session))
    },
    {
      prefix: 'saas-admin',
      session: {
        ...E2E_PLATFORM_ADMIN_SESSION,
        user: {
          ...E2E_PLATFORM_ADMIN_SESSION.user,
          permissions: [
            'admin:tenants:read',
            'admin:tenants:write',
            'admin:users:read',
          ],
        },
      },
      accessToken: 'e2e-tenants-access-token',
      refreshToken: 'e2e-tenants-refresh-token',
    },
  )
}

export async function mockTenantsPageApis(page: Page) {
  await mockAdminOverviewApis(page)

  await page.route('**/auth/refresh', async (route) => {
    if (route.request().method() !== 'POST') {
      await route.continue()
      return
    }
    await route.fulfill({
      status: 200,
      contentType: 'application/json',
      body: JSON.stringify({
        accessToken: 'e2e-tenants-access-token',
        refreshToken: 'e2e-tenants-refresh-token',
        expiresIn: 3600,
      }),
    })
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
      body: JSON.stringify(E2E_TENANTS_LIST),
    })
  })

  await page.route(/\/v1\/admin\/tenants\/[^/]+$/, async (route) => {
    if (route.request().method() !== 'GET') {
      await route.continue()
      return
    }
    const tenantId = new URL(route.request().url()).pathname.split('/').pop()!
    const tenant = E2E_TENANTS_LIST.tenants.find((row) => row.id === tenantId)
    if (!tenant) {
      await route.fulfill({ status: 404, body: '{}' })
      return
    }
    await route.fulfill({
      status: 200,
      contentType: 'application/json',
      body: JSON.stringify(tenant),
    })
  })

  await page.route(/\/v1\/admin\/tenants\/[^/]+\/data-export-requests/, async (route) => {
    await route.fulfill({
      status: 200,
      contentType: 'application/json',
      body: JSON.stringify({ requests: [] }),
    })
  })

  await page.route(/\/v1\/admin\/tenants\/[^/]+\/oidc-config/, async (route) => {
    const tenantId = route.request().url().split('/tenants/')[1]?.split('/')[0] ?? ''
    if (route.request().method() === 'PATCH') {
      const body = route.request().postDataJSON() as Record<string, unknown>
      await route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify({
          tenantId,
          enabled: body.enabled ?? false,
          displayName: body.displayName ?? null,
          issuerUri: body.issuerUri ?? null,
          clientId: body.clientId ?? null,
          configured: Boolean(body.issuerUri && body.clientId),
        }),
      })
      return
    }
    await route.fulfill({
      status: 200,
      contentType: 'application/json',
      body: JSON.stringify({
        tenantId,
        enabled: false,
        displayName: null,
        issuerUri: null,
        clientId: null,
        configured: false,
      }),
    })
  })

  await page.route(/\/v1\/admin\/tenants\/[^/]+\/storage-estimate/, async (route) => {
    const tenantId = route.request().url().split('/tenants/')[1]?.split('/')[0] ?? ''
    await route.fulfill({
      status: 200,
      contentType: 'application/json',
      body: JSON.stringify({
        tenantId,
        attachmentBytes: 0,
        mapLayerBytes: 0,
        totalBytes: 0,
        source: 'skeleton',
      }),
    })
  })

  await page.route(/\/v1\/admin\/tenants\/[^/]+\/menu-overrides(\/|$)/, async (route) => {
    const url = route.request().url()
    if (route.request().method() === 'PUT') {
      const body = route.request().postDataJSON() as Record<string, unknown>
      await route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify({
          id: 'e2e-override-1',
          tenantId: 'e2e-tenant-active',
          itemId: body.itemId,
          enabled: body.enabled ?? null,
          sortOrder: body.sortOrder ?? null,
          title: body.title ?? null,
        }),
      })
      return
    }
    if (route.request().method() === 'DELETE') {
      await route.fulfill({ status: 204, body: '' })
      return
    }
    await route.fulfill({
      status: 200,
      contentType: 'application/json',
      body: JSON.stringify({ overrides: [] }),
    })
  })
}
