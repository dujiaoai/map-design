import { expect, test } from '@playwright/test'

import {
  isRealApiE2eReady,
  loginViaRealApi,
} from './fixtures/real-api'

let realApiReady = false

test.describe.configure({ mode: 'serial' })

test.beforeAll(async () => {
  realApiReady = await isRealApiE2eReady()
})

test.describe('真实 API 联调', () => {
  test.beforeEach(() => {
    test.skip(
      !realApiReady,
      '需要 saas-api :8082 已启动且已执行 scripts/seed-demo-dev.sql',
    )
  })

  test('demo 账号登录后进入运营概览', async ({ page }) => {
    await loginViaRealApi(page)
    await expect(page.getByRole('heading', { name: '运营概览' })).toBeVisible({ timeout: 20_000 })
    await expect(page.getByText('Admin API 在线')).toBeVisible({ timeout: 20_000 })
  })

  test('概览展示真实统计数据', async ({ page }) => {
    await loginViaRealApi(page)
    await expect(page.getByRole('heading', { name: '运营概览' })).toBeVisible({ timeout: 20_000 })

    const tenantCard = page.locator('section').filter({ hasText: '租户总数' })
    await expect(tenantCard).toBeVisible()
    await expect(tenantCard).toContainText(/[1-9]\d*/)

    const userCard = page.locator('section').filter({ hasText: '用户总数' })
    await expect(userCard).toBeVisible()
    await expect(userCard).toContainText(/[1-9]\d*/)
  })

  test('租户列表可加载', async ({ page }) => {
    await loginViaRealApi(page)
    await page.goto('/tenants')
    await expect(page.getByText('加载中…')).toBeHidden({ timeout: 45_000 })
    await expect(page.getByRole('heading', { name: '租户', exact: true })).toBeVisible({ timeout: 20_000 })
    await expect(page.getByRole('table')).toBeVisible()
    await expect(page.getByText(/共 \d+ 个/)).toBeVisible()
    await expect(page.getByRole('searchbox', { name: '搜索名称或 slug…' })).toBeVisible()
  })
})
