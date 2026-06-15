import { z } from 'zod'

export const walletResponseSchema = z.object({
  walletId: z.string(),
  balance: z.number(),
  frozenBalance: z.number(),
  availableBalance: z.number(),
})

export type WalletResponse = z.infer<typeof walletResponseSchema>

export const ledgerEntrySchema = z.object({
  id: z.string(),
  entryType: z.string(),
  amount: z.number(),
  balanceAfter: z.number(),
  productCode: z.string().nullable().optional(),
  remark: z.string().nullable().optional(),
  createdAt: z.string(),
})

export const ledgerListResponseSchema = z.object({
  items: z.array(ledgerEntrySchema),
  page: z.number(),
  size: z.number(),
  total: z.number(),
})

export type LedgerEntry = z.infer<typeof ledgerEntrySchema>
export type LedgerListResponse = z.infer<typeof ledgerListResponseSchema>

export const rechargePackageSchema = z.object({
  id: z.string(),
  code: z.string(),
  points: z.number(),
  priceCents: z.number(),
  currency: z.string(),
})

export const rechargePackageListResponseSchema = z.object({
  items: z.array(rechargePackageSchema),
})

export type RechargePackage = z.infer<typeof rechargePackageSchema>

export const teamUsageItemSchema = z.object({
  userId: z.string(),
  totalPoints: z.number(),
  eventCount: z.number(),
})

export const teamUsageSummarySchema = z.object({
  from: z.string(),
  to: z.string(),
  productCode: z.string().nullable().optional(),
  totalPoints: z.number(),
  items: z.array(teamUsageItemSchema),
})

export type TeamUsageItem = z.infer<typeof teamUsageItemSchema>
export type TeamUsageSummary = z.infer<typeof teamUsageSummarySchema>

export const estimateResponseSchema = z.object({
  points: z.number(),
  unitLabel: z.string(),
  quantity: z.number(),
})

export type EstimateResponse = z.infer<typeof estimateResponseSchema>

export const rechargeOrderResponseSchema = z.object({
  orderNo: z.string(),
  status: z.string(),
  channel: z.string(),
  points: z.number(),
  priceCents: z.number(),
  currency: z.string(),
  payUrl: z.string().nullable().optional(),
  expireAt: z.string().nullable().optional(),
  paidAt: z.string().nullable().optional(),
  walletBalance: z.number(),
})

export type RechargeOrderResponse = z.infer<typeof rechargeOrderResponseSchema>

export const createRechargeOrderRequestSchema = z.object({
  packageCode: z.string(),
  channel: z.string().optional(),
})

export type CreateRechargeOrderRequest = z.infer<typeof createRechargeOrderRequestSchema>

export const transferRequestSchema = z.object({
  toUserId: z.string(),
  amount: z.number().int().positive(),
  remark: z.string().optional(),
  idempotencyKey: z.string(),
})

export const transferResponseSchema = z.object({
  fromWalletId: z.string(),
  toWalletId: z.string(),
  fromUserId: z.string(),
  toUserId: z.string(),
  amount: z.number(),
  fromBalanceAfter: z.number(),
  toBalanceAfter: z.number(),
  remark: z.string(),
  idempotentReplay: z.boolean(),
})

export type TransferRequest = z.infer<typeof transferRequestSchema>
export type TransferResponse = z.infer<typeof transferResponseSchema>

export const billingNotificationSchema = z.object({
  id: z.string(),
  category: z.string(),
  title: z.string(),
  body: z.string(),
  read: z.boolean(),
  createdAt: z.string().nullable().optional(),
})

export const billingNotificationListSchema = z.object({
  items: z.array(billingNotificationSchema),
  page: z.number(),
  size: z.number(),
  total: z.number(),
})

export const billingNotificationMarkAllReadSchema = z.object({
  markedCount: z.number(),
})

export const invoiceRequestSchema = z.object({
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
  createdAt: z.string().nullable().optional(),
  updatedAt: z.string().nullable().optional(),
})

export const invoiceListResponseSchema = z.object({
  items: z.array(invoiceRequestSchema),
  page: z.number(),
  size: z.number(),
  total: z.number(),
})

export const createInvoiceRequestSchema = z.object({
  orderNo: z.string(),
  invoiceType: z.enum(['personal', 'enterprise']),
  title: z.string(),
  taxNo: z.string().optional(),
  email: z.string().email(),
})

export type BillingNotification = z.infer<typeof billingNotificationSchema>
export type BillingNotificationListResponse = z.infer<typeof billingNotificationListSchema>
export type InvoiceRequest = z.infer<typeof invoiceRequestSchema>
export type InvoiceListResponse = z.infer<typeof invoiceListResponseSchema>
export type CreateInvoiceRequest = z.infer<typeof createInvoiceRequestSchema>
