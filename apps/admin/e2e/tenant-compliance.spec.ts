import { expect, test } from '@playwright/test'

import { E2E_TENANTS_LIST, mockTenantsPageApis, seedTenantsSession } from './fixtures/tenants-mock'

test.describe('租户合规 Tab（已登录 mock）', () => {
  test.beforeEach(async ({ page }) => {
    await seedTenantsSession(page)
    await mockTenantsPageApis(page)
  })

  test('展示 GDPR 导出与 OIDC 只读面板', async ({ page }) => {
    await page.goto('/')
    await expect(page.getByText('加载中…')).toBeHidden({ timeout: 45_000 })
    await page.goto('/tenants/e2e-tenant-active?tab=compliance')
    await expect(page.getByText('加载中…')).toBeHidden({ timeout: 45_000 })
    await expect(page.getByRole('tab', { name: '合规' })).toBeVisible({ timeout: 15_000 })
    await expect(page.getByText('GDPR 数据导出')).toBeVisible()
    await expect(page.getByText('租户 OIDC / SSO')).toBeVisible()
    await expect(page.getByText('存储用量估算')).toBeVisible()
    await expect(page.getByText('菜单覆盖')).toBeVisible()
    await expect(page.getByText('全部继承平台模板')).toBeVisible()
  })
})
