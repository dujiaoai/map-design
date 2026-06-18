import { expect, test } from '@playwright/test'

import { mockSystemPageApis, seedSystemSession } from './fixtures/system-mock'

test.describe('/system（已登录 mock）', () => {
  test.beforeEach(async ({ page }) => {
    await seedSystemSession(page)
    await mockSystemPageApis(page)
  })

  test('展示审计保留天数与 Webhook 摘要', async ({ page }) => {
    await page.goto('/')
    await expect(page.getByText('加载中…')).toBeHidden({ timeout: 45_000 })
    await page.goto('/system')
    await expect(page.getByText('加载中…')).toBeHidden({ timeout: 45_000 })
    await expect(page.getByRole('heading', { name: '系统' })).toBeVisible({ timeout: 15_000 })
    await expect(page.getByText('审计保留天数')).toBeVisible()
    await expect(page.getByText('365')).toBeVisible()
    await expect(page.getByText('csv_only')).toBeVisible()
  })
})
