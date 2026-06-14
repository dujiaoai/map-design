import { z } from 'zod'

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
      priceCents: z.number(),
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

function buildQuery(params: Record<string, string | number | undefined>) {
  const search = new URLSearchParams()
  for (const [key, value] of Object.entries(params)) {
    if (value === undefined || value === '') continue
    search.set(key, String(value))
  }
  const query = search.toString()
  return query ? `?${query}` : ''
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
