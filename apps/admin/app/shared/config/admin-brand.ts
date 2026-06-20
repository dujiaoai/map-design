const DEFAULTS = {
  appName: '云眼运营后台',
  consoleTitle: '运营控制台',
  loginEyebrow: 'Platform Console',
  loginTitle: '登录运营后台',
  productCode: 'map-design',
} as const

function readEnv(key: string): string | undefined {
  const value = import.meta.env[key]
  return typeof value === 'string' && value.trim().length > 0 ? value.trim() : undefined
}

/** Admin 品牌与默认产品上下文，可通过 VITE_ADMIN_* 外置（ADR-0019）。 */
export const adminBrand = {
  appName: readEnv('VITE_ADMIN_APP_NAME') ?? DEFAULTS.appName,
  consoleTitle: readEnv('VITE_ADMIN_CONSOLE_TITLE') ?? DEFAULTS.consoleTitle,
  loginEyebrow: readEnv('VITE_ADMIN_LOGIN_EYEBROW') ?? DEFAULTS.loginEyebrow,
  loginTitle: readEnv('VITE_ADMIN_LOGIN_TITLE') ?? DEFAULTS.loginTitle,
  defaultProductCode: readEnv('VITE_ADMIN_PRODUCT_CODE') ?? DEFAULTS.productCode,
} as const

export type AdminBrandConfig = typeof adminBrand
