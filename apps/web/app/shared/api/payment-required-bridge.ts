import type { PaymentRequiredDetail } from '@repo/api-client'

import { useInsufficientBalanceStore } from '~/features/billing/model/insufficient-balance-store'

export function handlePaymentRequired(detail: PaymentRequiredDetail): void {
  useInsufficientBalanceStore.getState().show(detail)
}
