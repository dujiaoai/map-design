export type BillingTab =
  | 'overview'
  | 'packages'
  | 'coupons'
  | 'wire-transfers'
  | 'wallets'
  | 'ledger'
  | 'reconciliation'
  | 'invoices'
  | 'orders'
  | 'usage'
  | 'adjust'

export type BillingGroup = 'overview' | 'catalog' | 'funds' | 'operations'

export const BILLING_TAB_LABELS: Record<BillingTab, string> = {
  overview: '概览',
  packages: '充值 SKU',
  coupons: '优惠券',
  wallets: '用户钱包',
  ledger: '积分流水',
  orders: '充值订单',
  'wire-transfers': '对公转账',
  adjust: '人工调账',
  reconciliation: '日对账',
  invoices: '发票申请',
  usage: '消费汇总',
}

export const BILLING_GROUP_DEFS: {
  id: BillingGroup
  label: string
  tabs: BillingTab[]
}[] = [
  { id: 'overview', label: '概览', tabs: ['overview'] },
  { id: 'catalog', label: '商品', tabs: ['packages', 'coupons'] },
  {
    id: 'funds',
    label: '资金',
    tabs: ['wallets', 'ledger', 'orders', 'wire-transfers', 'adjust'],
  },
  {
    id: 'operations',
    label: '运营',
    tabs: ['reconciliation', 'invoices', 'usage'],
  },
]

export const BILLING_TAB_VALUES: BillingTab[] = BILLING_GROUP_DEFS.flatMap((group) => group.tabs)

export type BillingNavigateTarget = {
  tab: BillingTab
  tenantId?: string
  userId?: string
}

export type BillingTabVisibility = {
  canRead: boolean
  canAdjust: boolean
  canWritePackages: boolean
  canRefund: boolean
}

export function canViewBillingTab(tab: BillingTab, visibility: BillingTabVisibility): boolean {
  const { canRead, canAdjust, canWritePackages, canRefund } = visibility
  const canViewPackages = canRead || canWritePackages
  const canViewOrders = canRead || canRefund

  switch (tab) {
    case 'overview':
    case 'wallets':
    case 'ledger':
    case 'reconciliation':
    case 'invoices':
    case 'wire-transfers':
    case 'usage':
      return canRead
    case 'packages':
    case 'coupons':
      return canViewPackages
    case 'orders':
      return canViewOrders
    case 'adjust':
      return canAdjust
    default:
      return false
  }
}

export function resolveBillingGroup(tab: BillingTab): BillingGroup {
  for (const group of BILLING_GROUP_DEFS) {
    if (group.tabs.includes(tab)) return group.id
  }
  return 'overview'
}

export function listVisibleBillingGroups(visibility: BillingTabVisibility): BillingGroup[] {
  return BILLING_GROUP_DEFS.filter((group) =>
    group.tabs.some((tab) => canViewBillingTab(tab, visibility)),
  ).map((group) => group.id)
}

export function listVisibleTabsInGroup(
  group: BillingGroup,
  visibility: BillingTabVisibility,
): BillingTab[] {
  const def = BILLING_GROUP_DEFS.find((item) => item.id === group)
  if (!def) return []
  return def.tabs.filter((tab) => canViewBillingTab(tab, visibility))
}

export function defaultBillingTabInGroup(
  group: BillingGroup,
  visibility: BillingTabVisibility,
): BillingTab | null {
  return listVisibleTabsInGroup(group, visibility)[0] ?? null
}

export function parseBillingTab(value: string | null, fallback: BillingTab): BillingTab {
  if (value && BILLING_TAB_VALUES.includes(value as BillingTab)) {
    return value as BillingTab
  }
  return fallback
}

/** 若当前 tab 不可见，回退到权限允许的首个 tab */
export function resolveAccessibleBillingTab(
  tab: BillingTab,
  fallback: BillingTab,
  visibility: BillingTabVisibility,
): BillingTab {
  if (canViewBillingTab(tab, visibility)) return tab
  const groups = listVisibleBillingGroups(visibility)
  for (const group of groups) {
    const first = defaultBillingTabInGroup(group, visibility)
    if (first) return first
  }
  return fallback
}
