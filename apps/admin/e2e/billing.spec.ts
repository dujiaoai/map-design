import { expect, test, type Page } from '@playwright/test'

import { mockAdminOverviewApis } from './fixtures/platform-admin-session'
import {
  mockBillingPageApis,
  resetBillingMockState,
  seedBillingSession,
} from './fixtures/billing-mock'

test.describe('计费运营（已登录 mock）', () => {
  test.beforeEach(async ({ page }) => {
    resetBillingMockState()
    await seedBillingSession(page)
    await mockAdminOverviewApis(page)
    await mockBillingPageApis(page)
  })

  async function warmSession(page: Page) {
    await page.goto('/')
    await expect(page.getByText('加载中…')).toBeHidden({ timeout: 45_000 })
  }

  async function gotoBillingOverview(page: Page) {
    await warmSession(page)
    await page.goto('/billing')
    await expect(page.getByText('加载中…')).toBeHidden({ timeout: 45_000 })
    await expect(page.getByText('当前账号无计费相关权限')).toBeHidden()
    await expect(page.getByRole('heading', { name: '计费', exact: true })).toBeVisible({
      timeout: 15_000,
    })
  }

  test('概览展示对账警示横幅与平台汇总', async ({ page }) => {
    await gotoBillingOverview(page)
    await expect(page.getByText('计费对账需关注')).toBeVisible()
    await expect(page.getByText(/1 条未关闭运维告警/)).toBeVisible()
    await expect(page.getByText('平台汇总')).toBeVisible()
    await expect(page.getByText('42')).toBeVisible()
  })

  test('日对账 Tab 展示运维告警并可标记已处理', async ({ page }) => {
    await warmSession(page)
    await page.goto('/billing?tab=reconciliation')
    await expect(page.getByText('加载中…')).toBeHidden({ timeout: 45_000 })
    await expect(page.getByRole('heading', { name: '日对账', level: 3 })).toBeVisible({ timeout: 15_000 })
    await expect(page.getByText('未关闭运维告警')).toBeVisible()
    await expect(page.getByText('日对账差异：2026-06-14')).toBeVisible()

    await page.getByRole('button', { name: '标记已处理' }).click()
    await expect(page.getByText('日对账差异：2026-06-14')).toBeHidden({ timeout: 10_000 })
    await expect(page.getByText('未关闭运维告警')).toBeHidden()
  })

  test('概览警示条可跳转日对账 Tab', async ({ page }) => {
    await gotoBillingOverview(page)
    await page.getByRole('button', { name: '查看日对账' }).click()
    await expect(page).toHaveURL(/tab=reconciliation/)
    await expect(page.getByRole('heading', { name: '日对账', level: 3 })).toBeVisible({ timeout: 15_000 })
  })
})
