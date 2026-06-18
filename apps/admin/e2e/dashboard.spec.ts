import { expect, test } from '@playwright/test'

import { mockAdminOverviewApis, seedPlatformAdminSession } from './fixtures/platform-admin-session'

test.describe('路由守卫冒烟', () => {
  test('未登录访问概览重定向至登录', async ({ page }) => {
    await page.goto('/')
    await expect(page.getByText('加载中…')).toBeHidden({ timeout: 45_000 })
    await expect(page).toHaveURL(/\/login/, { timeout: 15_000 })
  })
})

test.describe('运营概览（已登录 mock）', () => {
  test('展示统计卡片与 Admin API 在线状态', async ({ page }) => {
    await seedPlatformAdminSession(page)
    await mockAdminOverviewApis(page)

    await page.goto('/')
    await expect(page.getByText('加载中…')).toBeHidden({ timeout: 45_000 })

    await expect(page.getByRole('heading', { name: '运营概览' })).toBeVisible({ timeout: 15_000 })
    await expect(page.getByText('Admin API 在线')).toBeVisible()
    await expect(page.locator('section').filter({ hasText: '租户总数' })).toContainText('3')
    await expect(page.locator('section').filter({ hasText: '用户总数' })).toContainText('12')
    await expect(
      page
        .locator('section.admin-metric-card')
        .filter({ has: page.getByText('活跃租户', { exact: true }) }),
    ).toContainText('2')
    await expect(page.locator('section').filter({ hasText: '近 7 日活跃租户' })).toContainText('2')
    await expect(page.locator('section').filter({ hasText: '近 7 日新增用户' })).toContainText('4')
    await expect(
      page.locator('section.admin-metric-card').filter({ hasText: '已停用租户' }),
    ).toContainText('0')
    await expect(
      page
        .locator('section.admin-metric-card')
        .filter({ has: page.getByText('试用中', { exact: true }) }),
    ).toContainText('1')
    await expect(
      page.locator('section.admin-metric-card').filter({ hasText: '试用已到期' }),
    ).toContainText('0')
    await expect(page.getByText('近 7 日用量趋势')).toBeVisible()
    await expect(page.getByText('2026-06-18')).toBeVisible()
    await expect(page.getByText('审计 7')).toBeVisible()
  })
})
