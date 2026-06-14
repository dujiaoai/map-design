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
