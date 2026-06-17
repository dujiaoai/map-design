import { defineConfig, devices } from '@playwright/test'

const port = 5181
/** Windows 上 dev 常只监听 [::1]；用 localhost 避免 webServer 探活失败 */
const baseURL = `http://localhost:${port}`

export default defineConfig({
  testDir: './e2e',
  timeout: 60_000,
  fullyParallel: true,
  forbidOnly: Boolean(process.env.CI),
  retries: process.env.CI ? 2 : 0,
  /** 单 webServer 时多 worker 易在 HydrateFallback 阶段抢跑失败 */
  workers: 1,
  reporter: process.env.CI ? 'github' : 'list',
  use: {
    baseURL,
    trace: 'on-first-retry',
  },
  projects: [
    {
      name: 'mock',
      testIgnore: /real-api\.spec\.ts$/,
      use: { ...devices['Desktop Chrome'] },
    },
    {
      name: 'real-api',
      testMatch: /real-api\.spec\.ts$/,
      use: { ...devices['Desktop Chrome'] },
    },
  ],
  webServer: {
    command: 'pnpm run dev',
    url: `${baseURL}/login`,
    reuseExistingServer: !process.env.CI,
    timeout: 180_000,
    env: {
      ...process.env,
      VITE_API_URL: process.env.VITE_API_URL ?? '/v1',
      VITE_SAAS_API_HOST: process.env.VITE_SAAS_API_HOST ?? 'http://localhost:8082',
      VITE_BILLING_API_HOST: process.env.VITE_BILLING_API_HOST ?? 'http://localhost:8083',
    },
  },
})
