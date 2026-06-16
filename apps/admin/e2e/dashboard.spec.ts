import { expect, test } from '@playwright/test'

test.describe('路由守卫冒烟', () => {
  test('未登录访问概览重定向至登录', async ({ page }) => {
    await page.goto('/dashboard')
    await expect(page).toHaveURL(/\/login/)
  })
})
