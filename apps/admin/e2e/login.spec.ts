import { expect, test } from '@playwright/test'

test.describe('登录页冒烟', () => {
  test('展示登录表单与提交按钮', async ({ page }) => {
    await page.goto('/login')

    await expect(page).toHaveTitle(/登录 · 云眼运营后台/)
    await expect(page.getByRole('heading', { name: '运营后台登录' })).toBeVisible()
    await expect(page.getByLabel('邮箱')).toBeVisible()
    await expect(page.getByLabel('密码')).toBeVisible()
    await expect(page.getByLabel('租户 slug')).toBeVisible()
    await expect(page.getByRole('button', { name: '进入控制台' })).toBeVisible()
  })
})
