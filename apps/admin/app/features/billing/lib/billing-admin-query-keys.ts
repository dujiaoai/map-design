export const billingAdminQueryKeys = {
  all: ['admin', 'billing'] as const,
  stats: () => [...billingAdminQueryKeys.all, 'stats'] as const,
  packages: (filters: { status?: string; code?: string }, page: number) =>
    [...billingAdminQueryKeys.all, 'packages', filters, page] as const,
  coupons: (filters: { status?: string; code?: string }, page: number) =>
    [...billingAdminQueryKeys.all, 'coupons', filters, page] as const,
  wallets: (filters: { tenantId?: string; userId?: string }, page: number) =>
    [...billingAdminQueryKeys.all, 'wallets', filters, page] as const,
  rechargeOrders: (
    filters: { tenantId?: string; userId?: string; status?: string },
    page: number,
  ) => [...billingAdminQueryKeys.all, 'recharge-orders', filters, page] as const,
  usage: (filters: { tenantId?: string; productCode?: string }) =>
    [...billingAdminQueryKeys.all, 'usage', filters] as const,
  adjustRecords: (filters: { tenantId?: string; userId?: string }, page: number) =>
    [...billingAdminQueryKeys.all, 'adjust-records', filters, page] as const,
  ledger: (
    tenantId: string,
    filters: { userId?: string; entryType?: string },
    page: number,
  ) => [...billingAdminQueryKeys.all, 'ledger', tenantId, filters, page] as const,
  reconciliation: (date: string) =>
    [...billingAdminQueryKeys.all, 'reconciliation', date] as const,
  invoices: (
    filters: { tenantId?: string; userId?: string; status?: string },
    page: number,
  ) => [...billingAdminQueryKeys.all, 'invoices', filters, page] as const,
  wireTransfers: (
    filters: { tenantId?: string; userId?: string; status?: string },
    page: number,
  ) => [...billingAdminQueryKeys.all, 'wire-transfers', filters, page] as const,
}
