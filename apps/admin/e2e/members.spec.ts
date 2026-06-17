import { expect, test } from '@playwright/test'

import {
  E2E_TENANT_ID,
  mockMembersPageApis,
  seedMembersWriteSession,
} from './fixtures/members-mock'
import { mockAdminOverviewApis } from './fixtures/platform-admin-session'

test.describe('成员管理（已登录 mock）', () => {
  test.beforeEach(async ({ page }) => {
    await seedMembersWriteSession(page)
    await mockMembersPageApis(page)
    await mockAdminOverviewApis(page)
  })

  async function gotoMembersPage(page: import('@playwright/test').Page) {
    await page.goto('/')
    await expect(page.getByRole('heading', { name: '运营概览' })).toBeVisible({ timeout: 30_000 })
    await page.goto(`/members?tenantId=${E2E_TENANT_ID}`)
    await expect(page.getByText('加载中…')).toBeHidden({ timeout: 45_000 })
    await expect(page.getByRole('heading', { name: '租户成员' })).toBeVisible({ timeout: 15_000 })
  }

  test('展示成员列表与 Plan 配额', async ({ page }) => {
    await gotoMembersPage(page)
    await expect(page.getByText('member@demo.local')).toBeVisible()
    await expect(page.getByText('Demo Member')).toBeVisible()
    await expect(page.getByText('Plan 配额')).toBeVisible()
    await expect(page.getByText('成员席位').locator('..')).toContainText('1 / 10')
    const inviteButton = page.getByRole('button', { name: /邀请/ })
    if (await inviteButton.count()) {
      await inviteButton.first().click()
      await expect(page.getByRole('dialog')).toBeVisible()
      await expect(page.getByRole('tab', { name: '邮箱邀请' })).toBeVisible()
      await expect(page.getByRole('tab', { name: '邀请链接' })).toBeVisible()
    }
  })
})
