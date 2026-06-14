import { useMutation, useQueryClient } from '@tanstack/react-query'

import { billingClient } from '~/shared/api/billing-client'
import { billingQueryKeys } from '~/shared/queries/billing-queries'

export { transferResponseSchema, type TransferResponse } from '@repo/billing-client'

function createIdempotencyKey() {
  return `transfer:${crypto.randomUUID()}`
}

export function useBillingTransferMutation() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (input: { toUserId: string; amount: number; remark?: string }) => {
      const amount = Math.trunc(input.amount)
      if (!Number.isFinite(amount) || amount < 1) {
        throw new Error('划拨点数须为大于 0 的整数')
      }

      return billingClient.transfer({
        toUserId: input.toUserId.trim(),
        amount,
        remark: input.remark?.trim() || undefined,
        idempotencyKey: createIdempotencyKey(),
      })
    },
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: billingQueryKeys.all })
    },
  })
}
