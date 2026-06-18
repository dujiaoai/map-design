import type { Page } from '@playwright/test'

import { mockAdminOverviewApis, seedPlatformAdminSession } from './platform-admin-session'

const E2E_SYSTEM_FLAGS = {
  registration: {
    allowPublicOrgSignup: true,
    allowPublicPersonalSignup: false,
    registrationTokenTtl: 'PT24H',
  },
  auth: { passwordStrengthEnabled: true },
  mail: { enabled: false, fromAddress: '', outboundReady: false },
  rateLimit: { enabled: true, loginIpMaxAttempts: 20, loginAccountMaxAttempts: 10 },
  tenantRls: { enabled: true },
  billing: {
    integrationEnabled: true,
    baseUrl: 'http://localhost:8083',
    membershipPushEnabled: false,
  },
  mfa: {
    enforcementEnabled: false,
    totpEnrollmentAvailable: true,
    enrolledPlatformAdminCount: 0,
  },
  oidc: {
    enabled: false,
    authorizationCodeFlowAvailable: false,
    configuredProviderCount: 0,
  },
  audit: {
    webhookEnabled: false,
    webhookConfigured: false,
    webhookFormat: 'jsonl',
    deliveryMode: 'csv_only',
    retentionDays: 365,
  },
  runtime: { activeProfiles: ['test'], jwtPermEpoch: 1 },
}

export async function seedSystemSession(page: Page) {
  await seedPlatformAdminSession(page)
}

export async function mockSystemPageApis(page: Page) {
  await mockAdminOverviewApis(page)

  await page.route('**/admin/system/flags', async (route) => {
    await route.fulfill({
      status: 200,
      contentType: 'application/json',
      body: JSON.stringify(E2E_SYSTEM_FLAGS),
    })
  })

  await page.route('**/admin/system/dependencies', async (route) => {
    await route.fulfill({
      status: 200,
      contentType: 'application/json',
      body: JSON.stringify({
        edges: [{ from: 'saas-api', to: 'billing-api', kind: 'http' }],
        nodes: [
          {
            id: 'saas-api',
            label: 'saas-api',
            status: 'UP',
            url: 'http://localhost:8082',
            detail: 'ok',
          },
          {
            id: 'billing-api',
            label: 'billing-api',
            status: 'UP',
            url: 'http://localhost:8083',
            detail: 'ok',
          },
        ],
      }),
    })
  })

  await page.route('**/admin/mfa/status', async (route) => {
    await route.fulfill({
      status: 200,
      contentType: 'application/json',
      body: JSON.stringify({ enrolled: false, required: false }),
    })
  })
}
