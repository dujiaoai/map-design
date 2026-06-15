import { useMutation, useQueryClient } from '@tanstack/react-query'

import { billingClient } from '~/shared/api/billing-client'
import { billingQueryKeys } from '~/shared/queries/billing-queries'

export { type CreateInvoiceRequest, type InvoiceRequest } from '@repo/billing-client'

export function useCreateInvoiceMutation() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (input: {
      orderNo: string
      invoiceType: 'personal' | 'enterprise'
      title: string
      taxNo?: string
      email: string
    }) => billingClient.createInvoiceRequest(input),
    onSuccess: () =>
      queryClient.invalidateQueries({ queryKey: billingQueryKeys.all }),
  })
}
