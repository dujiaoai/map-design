import { useMutation, useQueryClient } from '@tanstack/react-query'

import { billingClient } from '~/shared/api/billing-client'
import { billingQueryKeys } from '~/shared/queries/billing-queries'

export { type RedeemCouponResponse } from '@repo/billing-client'

export function useRedeemCouponMutation() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (code: string) => billingClient.redeemCoupon(code),
    onSuccess: () =>
      queryClient.invalidateQueries({ queryKey: billingQueryKeys.all }),
  })
}
