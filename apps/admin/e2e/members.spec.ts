import { expect, test } from '@playwright/test'

import {
  E2E_TENANT_ID,
  mockMembersPageApis,
  seedMembersWriteSession,
} from './fixtures/members-mock'

test.describe('成员管理（已登录 mock）', () => {
  test.beforeEach(async ({ page }) => {
    await seedMembersWriteSession(page)
    await mockMembersPageApis(page)
  })

  test('展示成员列表与 Plan 配额', async ({ page }) => {
    await page.goto(`/members?tenantId=${E2E_TENANT_ID}`)

    await expect(page).toHaveTitle(/成员 · 云眼运营后台/)
    await expect(page.getByRole('heading', { name: '租户成员' })).toBeVisible()
    await expect(page.getByText('member@demo.local')).toBeVisible()
    await expect(page.getByText('Demo Member')).toBeVisible()
    await expect(page.getByText('Plan 配额')).toBeVisible()
    await expect(page.getByText('1 / 10')).toBeVisible()
  })

  test('邀请成员 Sheet 展示邮箱与链接 Tab', async ({ page }) => {
    await page.goto(`/members?tenantId=${E2E_TENANT_ID}`)

    await page.getByRole('button', { name: '邀请成员' }).click()

    await expect(page.getByRole('dialog')).toBeVisible()
    await expect(page.getByRole('heading', { name: '邀请成员' })).toBeVisible()
    await expect(page.getByRole('tab', { name: '邮箱邀请' })).toBeVisible()
    await expect(page.getByRole('tab', { name: '邀请链接' })).toBeVisible()
    await expect(page.getByLabel('邮箱')).toBeVisible()
  })
})
