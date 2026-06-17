import type { Page } from '@playwright/test'

import { E2E_PLATFORM_ADMIN_SESSION } from './platform-admin-session'

export const E2E_BILLING_ALERT_ID = 'e2e-billing-alert-1'

/** 计费页 E2E：读 + 调账（关闭运维告警） */
export const E2E_BILLING_SESSION = {
  ...E2E_PLATFORM_ADMIN_SESSION,
  user: {
    ...E2E_PLATFORM_ADMIN_SESSION.user,
    permissions: [
      'admin:tenants:read',
      'admin:billing:read',
      'admin:billing:adjust',
    ],
  },
}

const E2E_BILLING_STATS = {
  walletCount: 42,
  totalBalance: 128_000,
  paidRechargeOrderCount: 15,
  paidRechargeGmvCents: 735_000,
  pendingRechargeOrderCount: 2,
}

const E2E_RECONCILIATION_DAILY = {
  date: '2026-06-14',
  from: '2026-06-14T00:00:00Z',
  to: '2026-06-15T00:00:00Z',
  paidOrderCount: 2,
  paidOrderPoints: 1_000,
  paidOrderGmvCents: 9_800,
  rechargeLedgerCount: 1,
  rechargeLedgerPoints: 500,
  refundedOrderCount: 0,
  refundedOrderPoints: 0,
  refundedOrderGmvCents: 0,
  refundLedgerCount: 0,
  refundLedgerPoints: 0,
  balanced: false,
  discrepancies: ['paid_order_count_mismatch: orders=2 ledger=1'],
}

const E2E_OPEN_ALERT = {
  id: E2E_BILLING_ALERT_ID,
  alertType: 'reconciliation_daily',
  severity: 'critical',
  referenceKey: 'reconciliation:2026-06-14',
  title: '日对账差异：2026-06-14',
  body: 'UTC 日 2026-06-14 发现 1 项差异',
  createdAt: '2026-06-15T02:00:00Z',
}

let openAlertCount = 1

export function resetBillingMockState() {
  openAlertCount = 1
}

export async function seedBillingSession(page: Page) {
  await page.addInitScript(
    ({ prefix, session, accessToken, refreshToken }) => {
      localStorage.setItem(`${prefix}:access-token`, accessToken)
      localStorage.setItem(`${prefix}:refresh-token`, refreshToken)
      localStorage.setItem(`${prefix}:session`, JSON.stringify(session))
    },
    {
      prefix: 'saas-admin',
      session: E2E_BILLING_SESSION,
      accessToken: 'e2e-billing-access-token',
      refreshToken: 'e2e-billing-refresh-token',
    },
  )
}

/** 计费概览 / 日对账 Tab 所需 billing-api mock */
export async function mockBillingPageApis(page: Page) {
  await page.route('**/auth/refresh', async (route) => {
    if (route.request().method() !== 'POST') {
      await route.continue()
      return
    }
    await route.fulfill({
      status: 200,
      contentType: 'application/json',
      body: JSON.stringify({
        accessToken: 'e2e-billing-access-token',
        refreshToken: 'e2e-billing-refresh-token',
        expiresIn: 3600,
      }),
    })
  })

  await page.route(/\/v1\/admin\/billing\//, async (route) => {
    const method = route.request().method()
    const url = route.request().url()

    if (method === 'GET' && url.includes('/admin/billing/stats')) {
      await route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify(E2E_BILLING_STATS),
      })
      return
    }

    if (method === 'GET' && url.includes('/admin/billing/reconciliation/status')) {
      await route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify({
          checkedDate: '2026-06-14',
          balanced: false,
          discrepancyCount: 1,
          discrepancies: E2E_RECONCILIATION_DAILY.discrepancies,
          openAlertCount,
          lastAlertAt: '2026-06-15T02:00:00Z',
        }),
      })
      return
    }

    if (method === 'GET' && url.includes('/admin/billing/reconciliation/daily')) {
      await route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify(E2E_RECONCILIATION_DAILY),
      })
      return
    }

    if (method === 'GET' && url.includes('/admin/billing/ops-alerts')) {
      await route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify({
          items: openAlertCount > 0 ? [E2E_OPEN_ALERT] : [],
          page: 0,
          size: 20,
          total: openAlertCount,
        }),
      })
      return
    }

    if (
      method === 'POST' &&
      url.includes(`/admin/billing/ops-alerts/${E2E_BILLING_ALERT_ID}/resolve`)
    ) {
      openAlertCount = 0
      await route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify({
          id: E2E_BILLING_ALERT_ID,
          resolvedAt: '2026-06-15T08:00:00Z',
          idempotentReplay: false,
        }),
      })
      return
    }

    await route.continue()
  })
}
