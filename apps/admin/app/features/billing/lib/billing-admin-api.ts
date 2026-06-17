import { z } from 'zod'

/** 进入 /billing 或侧栏「计费」所需任一权限 */
export const BILLING_ACCESS_PERMISSIONS = [
  'admin:billing:read',
  'admin:billing:adjust',
  'admin:billing:packages:write',
  'admin:billing:refund',
] as const

export const RECHARGE_ORDER_STATUSES = [
  { value: 'all', label: '全部' },
  { value: 'pending', label: '待支付' },
  { value: 'paid', label: '已支付' },
  { value: 'cancelled', label: '已取消' },
  { value: 'refunded', label: '已退款' },
  { value: 'expired', label: '已过期' },
] as const

export const adminWalletListSchema = z.object({
  items: z.array(
    z.object({
      walletId: z.string(),
      tenantId: z.string(),
      userId: z.string(),
      balance: z.number(),
      frozenBalance: z.number(),
      availableBalance: z.number(),
    }),
  ),
  page: z.number(),
  size: z.number(),
  total: z.number(),
})

export const adminRechargeOrderListSchema = z.object({
  items: z.array(
    z.object({
      orderNo: z.string(),
      tenantId: z.string(),
      userId: z.string(),
      status: z.string(),
      channel: z.string(),
      points: z.number(),
      listPriceCents: z.number(),
      priceCents: z.number(),
      couponCode: z.string().nullable().optional(),
      couponDiscountCents: z.number(),
      currency: z.string(),
      providerTradeNo: z.string().nullable().optional(),
      paidAt: z.string().nullable().optional(),
      createdAt: z.string().nullable().optional(),
    }),
  ),
  page: z.number(),
  size: z.number(),
  total: z.number(),
})

export type AdminWalletList = z.infer<typeof adminWalletListSchema>
export type AdminRechargeOrderList = z.infer<typeof adminRechargeOrderListSchema>
export type AdminRechargeOrder = AdminRechargeOrderList['items'][number]

export const adminBillingStatsSchema = z.object({
  walletCount: z.number(),
  totalBalance: z.number(),
  paidRechargeOrderCount: z.number(),
  paidRechargeGmvCents: z.number(),
  pendingRechargeOrderCount: z.number(),
})

export const adminPackageListSchema = z.object({
  items: z.array(
    z.object({
      id: z.string(),
      code: z.string(),
      points: z.number(),
      priceCents: z.number(),
      currency: z.string(),
      status: z.string(),
      sortOrder: z.number(),
    }),
  ),
  page: z.number(),
  size: z.number(),
  total: z.number(),
})

export type AdminBillingStats = z.infer<typeof adminBillingStatsSchema>
export type AdminPackageList = z.infer<typeof adminPackageListSchema>

export const adminPackageSchema = z.object({
  id: z.string(),
  code: z.string(),
  points: z.number(),
  priceCents: z.number(),
  currency: z.string(),
  status: z.string(),
  sortOrder: z.number(),
})

export type AdminPackage = z.infer<typeof adminPackageSchema>

export const adminUsageSummarySchema = z.object({
  from: z.string(),
  to: z.string(),
  productCode: z.string().nullable().optional(),
  totalPoints: z.number(),
  page: z.number(),
  size: z.number(),
  total: z.number(),
  items: z.array(
    z.object({
      tenantId: z.string(),
      userId: z.string(),
      totalPoints: z.number(),
      eventCount: z.number(),
    }),
  ),
})

export type AdminUsageSummary = z.infer<typeof adminUsageSummarySchema>

export const adminRefundResponseSchema = z.object({
  orderNo: z.string(),
  tenantId: z.string(),
  userId: z.string(),
  status: z.string(),
  pointsRefunded: z.number(),
  walletBalanceAfter: z.number(),
  reason: z.string(),
  idempotentReplay: z.boolean(),
})

export type AdminRefundResponse = z.infer<typeof adminRefundResponseSchema>

export const adminAdjustRecordListSchema = z.object({
  items: z.array(
    z.object({
      id: z.string(),
      walletId: z.string(),
      tenantId: z.string(),
      userId: z.string(),
      amount: z.number(),
      balanceAfter: z.number(),
      remark: z.string(),
      idempotencyKey: z.string(),
      createdAt: z.string().nullable().optional(),
    }),
  ),
  page: z.number(),
  size: z.number(),
  total: z.number(),
})

export type AdminAdjustRecordList = z.infer<typeof adminAdjustRecordListSchema>

export const adminLedgerListSchema = z.object({
  items: z.array(
    z.object({
      id: z.string(),
      walletId: z.string(),
      tenantId: z.string(),
      userId: z.string(),
      entryType: z.string(),
      amount: z.number(),
      balanceAfter: z.number(),
      productCode: z.string(),
      remark: z.string(),
      createdAt: z.string().nullable().optional(),
    }),
  ),
  page: z.number(),
  size: z.number(),
  total: z.number(),
})

export type AdminLedgerList = z.infer<typeof adminLedgerListSchema>

export const adminReconciliationDailySchema = z.object({
  date: z.string(),
  from: z.string(),
  to: z.string(),
  paidOrderCount: z.number(),
  paidOrderPoints: z.number(),
  paidOrderGmvCents: z.number(),
  rechargeLedgerCount: z.number(),
  rechargeLedgerPoints: z.number(),
  refundedOrderCount: z.number(),
  refundedOrderPoints: z.number(),
  refundedOrderGmvCents: z.number(),
  refundLedgerCount: z.number(),
  refundLedgerPoints: z.number(),
  balanced: z.boolean(),
  discrepancies: z.array(z.string()),
})

export type AdminReconciliationDaily = z.infer<typeof adminReconciliationDailySchema>

export const adminReconciliationStatusSchema = z.object({
  checkedDate: z.string(),
  balanced: z.boolean(),
  discrepancyCount: z.number(),
  discrepancies: z.array(z.string()),
  openAlertCount: z.number(),
  lastAlertAt: z.string().nullable().optional(),
})

export type AdminReconciliationStatus = z.infer<typeof adminReconciliationStatusSchema>

export const adminOpsAlertListSchema = z.object({
  items: z.array(
    z.object({
      id: z.string(),
      alertType: z.string(),
      severity: z.string(),
      referenceKey: z.string(),
      title: z.string(),
      body: z.string(),
      resolvedAt: z.string().nullable().optional(),
      createdAt: z.string().nullable().optional(),
    }),
  ),
  page: z.number(),
  size: z.number(),
  total: z.number(),
})

export const adminOpsAlertResolveSchema = z.object({
  id: z.string(),
  resolvedAt: z.string(),
  idempotentReplay: z.boolean(),
})

export type AdminOpsAlertList = z.infer<typeof adminOpsAlertListSchema>
export type AdminOpsAlert = AdminOpsAlertList['items'][number]

export const INVOICE_STATUSES = [
  { value: 'all', label: '全部' },
  { value: 'pending', label: '待处理' },
  { value: 'issued', label: '已开具' },
  { value: 'rejected', label: '已驳回' },
] as const

export const adminInvoiceListSchema = z.object({
  items: z.array(
    z.object({
      id: z.string(),
      tenantId: z.string(),
      userId: z.string(),
      orderNo: z.string(),
      invoiceType: z.string(),
      title: z.string(),
      taxNo: z.string().nullable().optional(),
      email: z.string(),
      status: z.string(),
      amountCents: z.number(),
      currency: z.string(),
      adminRemark: z.string().nullable().optional(),
      pdfUrl: z.string().nullable().optional(),
      createdAt: z.string().nullable().optional(),
      updatedAt: z.string().nullable().optional(),
    }),
  ),
  page: z.number(),
  size: z.number(),
  total: z.number(),
})

export type AdminInvoiceList = z.infer<typeof adminInvoiceListSchema>
export type AdminInvoice = AdminInvoiceList['items'][number]

export const adminCouponListSchema = z.object({
  items: z.array(
    z.object({
      id: z.string(),
      code: z.string(),
      kind: z.string().default('gift'),
      points: z.number(),
      discountCents: z.number().nullable().optional(),
      status: z.string(),
      maxTotalRedemptions: z.number().nullable().optional(),
      redemptionCount: z.number(),
      maxPerUser: z.number(),
      validUntil: z.string().nullable().optional(),
      createdAt: z.string().nullable().optional(),
    }),
  ),
  page: z.number(),
  size: z.number(),
  total: z.number(),
})

export const adminCouponSchema = adminCouponListSchema.shape.items.element

export type AdminCouponList = z.infer<typeof adminCouponListSchema>
export type AdminCoupon = z.infer<typeof adminCouponSchema>

export const WIRE_TRANSFER_STATUSES = [
  { value: 'all', label: '全部' },
  { value: 'pending', label: '待审核' },
  { value: 'credited', label: '已入账' },
  { value: 'rejected', label: '已驳回' },
] as const

export const adminWireTransferListSchema = z.object({
  items: z.array(
    z.object({
      id: z.string(),
      requestNo: z.string(),
      tenantId: z.string(),
      userId: z.string(),
      companyName: z.string(),
      contactEmail: z.string(),
      amountCents: z.number(),
      points: z.number(),
      bankReference: z.string().nullable().optional(),
      status: z.string(),
      adminRemark: z.string().nullable().optional(),
      createdAt: z.string().nullable().optional(),
      updatedAt: z.string().nullable().optional(),
    }),
  ),
  page: z.number(),
  size: z.number(),
  total: z.number(),
})

export type AdminWireTransferList = z.infer<typeof adminWireTransferListSchema>
export type AdminWireTransfer = AdminWireTransferList['items'][number]

function buildQuery(params: Record<string, string | number | undefined>) {
  const search = new URLSearchParams()
  for (const [key, value] of Object.entries(params)) {
    if (value === undefined || value === '') continue
    search.set(key, String(value))
  }
  const query = search.toString()
  return query ? `?${query}` : ''
}

export function adminBillingPackagesQuery(params: {
  status?: string
  code?: string
  page?: number
  size?: number
}) {
  return buildQuery({
    status: params.status && params.status !== 'all' ? params.status : undefined,
    code: params.code,
    page: params.page ?? 0,
    size: params.size ?? 20,
  })
}

export function adminBillingCouponsQuery(params: {
  status?: string
  code?: string
  page?: number
  size?: number
}) {
  return buildQuery({
    status: params.status && params.status !== 'all' ? params.status : undefined,
    code: params.code,
    page: params.page ?? 0,
    size: params.size ?? 20,
  })
}

export function adminBillingWalletsQuery(params: {
  tenantId?: string
  userId?: string
  page?: number
  size?: number
}) {
  return buildQuery({
    tenantId: params.tenantId,
    userId: params.userId,
    page: params.page ?? 0,
    size: params.size ?? 20,
  })
}

export function adminBillingRechargeOrdersQuery(params: {
  tenantId?: string
  userId?: string
  status?: string
  page?: number
  size?: number
}) {
  return buildQuery({
    tenantId: params.tenantId,
    userId: params.userId,
    status: params.status,
    page: params.page ?? 0,
    size: params.size ?? 20,
  })
}

export function adminBillingUsageQuery(params: {
  tenantId?: string
  productCode?: string
  page?: number
  size?: number
}) {
  return buildQuery({
    tenantId: params.tenantId,
    productCode: params.productCode,
    page: params.page ?? 0,
    size: params.size ?? 20,
  })
}

export function adminBillingAdjustRecordsQuery(params: {
  tenantId?: string
  userId?: string
  page?: number
  size?: number
}) {
  return buildQuery({
    tenantId: params.tenantId,
    userId: params.userId,
    page: params.page ?? 0,
    size: params.size ?? 20,
  })
}

export function adminBillingLedgerQuery(params: {
  userId?: string
  entryType?: string
  page?: number
  size?: number
}) {
  return buildQuery({
    userId: params.userId,
    entryType: params.entryType,
    page: params.page ?? 0,
    size: params.size ?? 20,
  })
}

export function adminBillingReconciliationQuery(params: { date?: string }) {
  return buildQuery({ date: params.date })
}

export function adminBillingInvoicesQuery(params: {
  tenantId?: string
  userId?: string
  status?: string
  page?: number
  size?: number
}) {
  return buildQuery({
    tenantId: params.tenantId,
    userId: params.userId,
    status: params.status,
    page: params.page ?? 0,
    size: params.size ?? 20,
  })
}

export function adminBillingWireTransfersQuery(params: {
  tenantId?: string
  userId?: string
  status?: string
  page?: number
  size?: number
}) {
  return buildQuery({
    tenantId: params.tenantId,
    userId: params.userId,
    status: params.status,
    page: params.page ?? 0,
    size: params.size ?? 20,
  })
}

/** UTC 昨日，对齐 billing-api 默认对账日 */
export function defaultReconciliationDateUtc() {
  const date = new Date()
  date.setUTCDate(date.getUTCDate() - 1)
  return date.toISOString().slice(0, 10)
}
