import { expect, test, type Page } from '@playwright/test'

import { mockAuditPageApis, seedAuditSession } from './fixtures/audit-mock'
import { mockAdminOverviewApis } from './fixtures/platform-admin-session'

test.describe('审计日志（已登录 mock）', () => {
  test.beforeEach(async ({ page }) => {
    await seedAuditSession(page)
    await mockAdminOverviewApis(page)
    await mockAuditPageApis(page)
  })

  async function gotoAuditPage(page: Page) {
    await page.goto('/')
    await expect(page.getByText('加载中…')).toBeHidden({ timeout: 45_000 })
    await page.goto('/audit-logs')
    await expect(page.getByText('加载中…')).toBeHidden({ timeout: 45_000 })
    await expect(page.getByRole('heading', { name: '审计日志', exact: true })).toBeVisible({
      timeout: 15_000,
    })
  }

  test('展示审计列表与计费动作', async ({ page }) => {
    await gotoAuditPage(page)
    await expect(page.getByRole('table')).toBeVisible()
    await expect(page.getByText('tenant.update')).toBeVisible()
    await expect(page.getByText('billing.adjust')).toBeVisible()
    await expect(page.getByText('admin@demo.local').first()).toBeVisible()
  })

  test('日期范围筛选控件可见', async ({ page }) => {
    await gotoAuditPage(page)
    await expect(page.getByPlaceholder('起始日期')).toBeVisible()
    await expect(page.getByPlaceholder('结束日期')).toBeVisible()
  })

  test('导出 CSV 按钮可用', async ({ page }) => {
    await gotoAuditPage(page)
    const exportButton = page.getByRole('button', { name: '导出 CSV' })
    await expect(exportButton).toBeVisible()
    await exportButton.click()
    await expect(page.getByText('审计日志 CSV 已开始下载')).toBeVisible({ timeout: 10_000 })
  })

  test('csv_only 模式展示 Webhook 配置与签名状态', async ({ page }) => {
    await gotoAuditPage(page)
    await expect(page.getByText('csv_only')).toBeVisible()
    await expect(page.getByText('HMAC 签名')).toBeVisible()
    await expect(page.getByText('未启用')).toBeVisible()
    await expect(page.getByRole('link', { name: '系统' })).toBeVisible()
  })
})
