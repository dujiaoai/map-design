import { useMutation, useQueryClient } from '@tanstack/react-query'
import { z } from 'zod'

import { billingApi } from '~/shared/api/billing-client'
import { billingQueryKeys } from '~/shared/queries/billing-queries'

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

function invalidateBillingQueries(queryClient: ReturnType<typeof useQueryClient>) {
  return queryClient.invalidateQueries({ queryKey: billingQueryKeys.all })
}

export function useCreateRechargeOrderMutation() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async (input: { packageCode: string; channel?: string }) =>
      rechargeOrderResponseSchema.parse(
        await billingApi.post<RechargeOrderResponse>('/recharge-orders', {
          packageCode: input.packageCode,
          channel: input.channel ?? 'mock',
        }),
      ),
    onSuccess: () => invalidateBillingQueries(queryClient),
  })
}

export function useMockPayRechargeOrderMutation() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async (orderNo: string) =>
      rechargeOrderResponseSchema.parse(
        await billingApi.post<RechargeOrderResponse>(
          `/recharge-orders/${encodeURIComponent(orderNo)}/mock-pay`,
        ),
      ),
    onSuccess: () => invalidateBillingQueries(queryClient),
  })
}

export function useCancelRechargeOrderMutation() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async (orderNo: string) =>
      rechargeOrderResponseSchema.parse(
        await billingApi.post<RechargeOrderResponse>(
          `/recharge-orders/${encodeURIComponent(orderNo)}/cancel`,
        ),
      ),
    onSuccess: () => invalidateBillingQueries(queryClient),
  })
}
