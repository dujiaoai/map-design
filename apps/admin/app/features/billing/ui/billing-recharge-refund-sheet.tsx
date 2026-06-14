import {
  Button,
  Input,
  Sheet,
  SheetContent,
  SheetDescription,
  SheetFooter,
  SheetHeader,
  SheetTitle,
} from '@repo/ui'
import { useMutation, useQueryClient } from '@tanstack/react-query'
import { useEffect, useId, useState } from 'react'

import { adminRefundResponseSchema } from '~/features/billing/lib/billing-admin-api'
import { billingAdminQueryKeys } from '~/features/billing/lib/billing-admin-query-keys'
import { billingAdminApi } from '~/shared/api/billing-admin-client'
import { formatAdminApiError } from '~/shared/lib/format-admin-api-error'
import { AdminField, AdminFormError } from '~/shared/ui/admin-field'

function createRefundIdempotencyKey(orderNo: string) {
  return `admin-refund:${orderNo}:${crypto.randomUUID()}`
}

export function BillingRechargeRefundSheet({
  orderNo,
  open,
  onOpenChange,
}: {
  orderNo: string | null
  open: boolean
  onOpenChange: (open: boolean) => void
}) {
  const queryClient = useQueryClient()
  const reasonInputId = useId()
  const [reason, setReason] = useState('customer_request')

  useEffect(() => {
    if (open) {
      setReason('customer_request')
    }
  }, [open, orderNo])

  const mutation = useMutation({
    mutationFn: async () => {
      if (!orderNo) throw new Error('未选择订单')
      const trimmed = reason.trim()
      if (!trimmed) throw new Error('请填写退款原因')
      return adminRefundResponseSchema.parse(
        await billingAdminApi.post(`/recharge-orders/${encodeURIComponent(orderNo)}/refund`, {
          reason: trimmed,
          idempotencyKey: createRefundIdempotencyKey(orderNo),
        }),
      )
    },
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: billingAdminQueryKeys.all })
      onOpenChange(false)
    },
  })

  const formError = mutation.error ? formatAdminApiError(mutation.error) : null

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent className="w-full sm:max-w-md">
        <SheetHeader>
          <SheetTitle className="admin-display text-lg">充值退款</SheetTitle>
          <SheetDescription>
            订单 <span className="font-mono">{orderNo ?? '—'}</span>：扣回积分并标记已退款。
          </SheetDescription>
        </SheetHeader>

        <form
          className="flex flex-1 flex-col gap-4 px-4"
          onSubmit={(event) => {
            event.preventDefault()
            mutation.mutate()
          }}
        >
          <AdminField label="退款原因" htmlFor={reasonInputId}>
            <Input
              id={reasonInputId}
              value={reason}
              onChange={(event) => setReason(event.target.value)}
              placeholder="customer_request"
              required
            />
          </AdminField>
          <AdminFormError message={formError} />
          <SheetFooter className="px-0">
            <Button type="submit" variant="destructive" disabled={!orderNo || mutation.isPending}>
              {mutation.isPending ? '提交中…' : '确认退款'}
            </Button>
          </SheetFooter>
        </form>
      </SheetContent>
    </Sheet>
  )
}
