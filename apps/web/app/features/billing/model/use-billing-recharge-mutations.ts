import { useMutation, useQueryClient } from '@tanstack/react-query'

import type { CreateRechargeOrderRequest } from '@repo/billing-client'

import { billingClient } from '~/shared/api/billing-client'
import { billingQueryKeys } from '~/shared/queries/billing-queries'

export { rechargeOrderResponseSchema, type RechargeOrderResponse } from '@repo/billing-client'

function invalidateBillingQueries(queryClient: ReturnType<typeof useQueryClient>) {
  return queryClient.invalidateQueries({ queryKey: billingQueryKeys.all })
}

export function useCreateRechargeOrderMutation() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (input: CreateRechargeOrderRequest) => billingClient.createRechargeOrder(input),
    onSuccess: () => invalidateBillingQueries(queryClient),
  })
}

export function useMockPayRechargeOrderMutation() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (orderNo: string) => billingClient.mockPayRechargeOrder(orderNo),
    onSuccess: () => invalidateBillingQueries(queryClient),
  })
}

export function useCancelRechargeOrderMutation() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (orderNo: string) => billingClient.cancelRechargeOrder(orderNo),
    onSuccess: () => invalidateBillingQueries(queryClient),
  })
}
