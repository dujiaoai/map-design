export type PricingPlan = {
  code: string
  name: string
  points: number
  priceCents: number
  highlight?: boolean
  description: string
}

/** 与 billing-api V2 种子套餐对齐（Marketing 静态展示） */
export const PRICING_PLANS: PricingPlan[] = [
  {
    code: 'starter_500',
    name: '入门包',
    points: 500,
    priceCents: 4900,
    description: '适合个人轻度使用与功能试用',
  },
  {
    code: 'standard_2000',
    name: '标准包',
    points: 2000,
    priceCents: 17900,
    highlight: true,
    description: '适合日常地图作业与小团队个人充值',
  },
  {
    code: 'pro_5000',
    name: '专业包',
    points: 5000,
    priceCents: 39900,
    description: '适合高频分析与批量导出场景',
  },
]

export const SIGNUP_BONUS = {
  personal: 500,
  organizationFirstAdmin: 1000,
} as const

export function formatPriceCents(cents: number): string {
  return `¥${(cents / 100).toLocaleString('zh-CN', { minimumFractionDigits: 0, maximumFractionDigits: 2 })}`
}

export function formatPoints(points: number): string {
  return points.toLocaleString('zh-CN')
}
