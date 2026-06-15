import { useMutation, useQueryClient } from '@tanstack/react-query'

import { billingClient } from '~/shared/api/billing-client'
import { billingQueryKeys } from '~/shared/queries/billing-queries'

export { type CreateWireTransferRequest, type WireTransferRequest } from '@repo/billing-client'

export function useCreateWireTransferMutation() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (input: {
      companyName: string
      contactEmail: string
      amountCents: number
      points: number
      bankReference?: string
    }) => billingClient.createWireTransferRequest(input),
    onSuccess: () =>
      queryClient.invalidateQueries({ queryKey: billingQueryKeys.all }),
  })
}
