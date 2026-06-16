import type { Page } from '@playwright/test'

import {
  E2E_PLATFORM_ADMIN_SESSION,
  seedPlatformAdminSession,
} from './platform-admin-session'

export const E2E_TENANT_ID = 'e2e-tenant-demo'

/** 成员页 E2E：含 tenants:write 以展示「邀请成员」按钮 */
export const E2E_MEMBERS_WRITE_SESSION = {
  ...E2E_PLATFORM_ADMIN_SESSION,
  user: {
    ...E2E_PLATFORM_ADMIN_SESSION.user,
    permissions: [
      'admin:tenants:read',
      'admin:users:read',
      'admin:roles:read',
      'admin:tenants:write',
    ],
  },
}

const E2E_TENANT = {
  id: E2E_TENANT_ID,
  name: 'Demo Tenant',
  slug: 'demo',
  plan: 'pro',
  status: 'active',
  createdAt: 1_700_000_000_000,
}

const E2E_MEMBERS = {
  members: [
    {
      id: 'e2e-member-1',
      email: 'member@demo.local',
      displayName: 'Demo Member',
      status: 'active',
      tenantId: E2E_TENANT_ID,
      tenantSlug: 'demo',
      tenantName: 'Demo Tenant',
      roles: ['MEMBER'],
      createdAt: 1_700_000_000_000,
      lastLoginAt: 1_700_000_100_000,
    },
  ],
}

const E2E_QUOTAS = {
  tenantId: E2E_TENANT_ID,
  plan: 'pro',
  seats: { limit: 10, used: 1 },
  apiRate: { limitPerMinute: 100 },
  storage: { limitBytes: 1_073_741_824, usedBytes: 1_048_576 },
}

const E2E_ASSIGNABLE_ROLES = {
  roles: [{ code: 'MEMBER', name: '成员', builtin: true }],
}

const E2E_INVITE_LINKS = { links: [] as unknown[] }

export async function seedMembersWriteSession(page: Page) {
  await page.addInitScript(
    ({ prefix, session, accessToken, refreshToken }) => {
      localStorage.setItem(`${prefix}:access-token`, accessToken)
      localStorage.setItem(`${prefix}:refresh-token`, refreshToken)
      localStorage.setItem(`${prefix}:session`, JSON.stringify(session))
    },
    {
      prefix: 'saas-admin',
      session: E2E_MEMBERS_WRITE_SESSION,
      accessToken: 'e2e-access-token',
      refreshToken: 'e2e-refresh-token',
    },
  )
}

/** 成员列表页所需 Admin API mock（租户详情、成员、配额、邀请相关） */
export async function mockMembersPageApis(page: Page) {
  await page.route(`**/admin/tenants/${E2E_TENANT_ID}/members**`, async (route) => {
    if (route.request().method() !== 'GET') {
      await route.continue()
      return
    }
    await route.fulfill({
      status: 200,
      contentType: 'application/json',
      body: JSON.stringify(E2E_MEMBERS),
    })
  })

  await page.route(`**/admin/tenants/${E2E_TENANT_ID}/quotas**`, async (route) => {
    await route.fulfill({
      status: 200,
      contentType: 'application/json',
      body: JSON.stringify(E2E_QUOTAS),
    })
  })

  await page.route(`**/admin/tenants/${E2E_TENANT_ID}/assignable-roles**`, async (route) => {
    await route.fulfill({
      status: 200,
      contentType: 'application/json',
      body: JSON.stringify(E2E_ASSIGNABLE_ROLES),
    })
  })

  await page.route(`**/admin/tenants/${E2E_TENANT_ID}/invite-links**`, async (route) => {
    await route.fulfill({
      status: 200,
      contentType: 'application/json',
      body: JSON.stringify(E2E_INVITE_LINKS),
    })
  })

  await page.route(`**/admin/tenants/${E2E_TENANT_ID}`, async (route) => {
    if (route.request().method() !== 'GET') {
      await route.continue()
      return
    }
    const path = new URL(route.request().url()).pathname
    if (path !== `/admin/tenants/${E2E_TENANT_ID}`) {
      await route.continue()
      return
    }
    await route.fulfill({
      status: 200,
      contentType: 'application/json',
      body: JSON.stringify(E2E_TENANT),
    })
  })
}

export { seedPlatformAdminSession }
