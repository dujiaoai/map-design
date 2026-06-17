import { expect, test } from '@playwright/test'

import { mockAdminLoginApi } from './fixtures/login-mock'
import { mockAdminOverviewApis } from './fixtures/platform-admin-session'

test.describe('登录页冒烟', () => {
  test('展示登录表单与提交按钮', async ({ page }) => {
    await page.goto('/login')

    await expect(page.getByRole('heading', { name: '运营后台登录' })).toBeVisible({ timeout: 30_000 })
    await expect(page.getByRole('textbox', { name: '邮箱' })).toBeVisible()
    await expect(page.getByRole('textbox', { name: '密码' })).toBeVisible()
    await expect(page.getByLabel('租户 slug')).toBeVisible()
    await expect(page.getByRole('button', { name: '进入控制台' })).toBeVisible()
  })

  test('mock 登录成功后进入概览', async ({ page }) => {
    await mockAdminLoginApi(page)
    await mockAdminOverviewApis(page)

    await page.goto('/login')
    await expect(page.getByRole('textbox', { name: '邮箱' })).toBeVisible({ timeout: 30_000 })
    await page.getByRole('textbox', { name: '邮箱' }).fill('e2e-login@demo.local')
    await page.getByRole('textbox', { name: '密码' }).fill('password')
    await page.getByLabel('租户 slug').fill('demo')
    await page.getByRole('button', { name: '进入控制台' }).click()

    await expect(page).not.toHaveURL(/\/login/)
    await expect(page.getByRole('heading', { name: '运营概览' })).toBeVisible()
  })
})
