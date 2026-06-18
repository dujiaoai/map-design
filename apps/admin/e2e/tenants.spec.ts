import { expect, test } from '@playwright/test'

import { mockTenantsPageApis, seedTenantsSession } from './fixtures/tenants-mock'

test.describe('租户列表（已登录 mock）', () => {
  test.beforeEach(async ({ page }) => {
    await seedTenantsSession(page)
    await mockTenantsPageApis(page)
  })

  async function gotoTenants(page: import('@playwright/test').Page) {
    await page.goto('/')
    await expect(page.getByText('加载中…')).toBeHidden({ timeout: 45_000 })
    await page.goto('/tenants')
    await expect(page.getByText('加载中…')).toBeHidden({ timeout: 45_000 })
    await expect(page.getByRole('heading', { name: '租户', exact: true })).toBeVisible({
      timeout: 15_000,
    })
  }

  test('展示生命周期列与试用截止', async ({ page }) => {
    await gotoTenants(page)
    const main = page.locator('main')
    await expect(main.getByText('生命周期')).toBeVisible()
    await expect(main).toContainText('Active Corp')
    await expect(main).toContainText('Trial Startup')
    await expect(main).toContainText('试用到期')
    await expect(main).toContainText('已停用')
  })

  test('生命周期筛选仅展示试用中租户', async ({ page }) => {
    await gotoTenants(page)
    await page.getByRole('combobox').nth(1).click()
    await page.getByRole('option', { name: '试用中' }).click()
    await expect(page.getByText('Trial Startup')).toBeVisible()
    await expect(page.getByText('Active Corp')).toBeHidden()
    await expect(page.getByText('Expired Trial Co')).toBeHidden()
  })
})
