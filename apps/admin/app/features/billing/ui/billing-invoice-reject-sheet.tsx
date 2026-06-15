import {
  Button,
  Input,
  Sheet,
  SheetContent,
  SheetDescription,
  SheetFooter,
  SheetHeader,
  SheetTitle,
  toast,
} from '@repo/ui'
import { useMutation, useQueryClient } from '@tanstack/react-query'
import { useEffect, useId, useState } from 'react'

import type { AdminInvoice } from '~/features/billing/lib/billing-admin-api'
import { formatBillingPrice } from '~/features/billing/lib/billing-format'
import { billingAdminQueryKeys } from '~/features/billing/lib/billing-admin-query-keys'
import { billingAdminApi } from '~/shared/api/billing-admin-client'
import { formatAdminApiError } from '~/shared/lib/format-admin-api-error'
import { AdminField, AdminFormError } from '~/shared/ui/admin-field'
import { AdminIdCell } from '~/shared/ui/admin-id-cell'

export function BillingInvoiceRejectSheet({
  invoice,
  open,
  onOpenChange,
}: {
  invoice: AdminInvoice | null
  open: boolean
  onOpenChange: (open: boolean) => void
}) {
  const queryClient = useQueryClient()
  const reasonInputId = useId()
  const [reason, setReason] = useState('抬头信息有误')
  const [validationError, setValidationError] = useState<string | null>(null)

  useEffect(() => {
    if (open) {
      setReason('抬头信息有误')
      setValidationError(null)
    }
  }, [open, invoice?.id])

  const mutation = useMutation({
    mutationFn: async (payload: { invoiceId: string; reason: string }) => {
      await billingAdminApi.post(`/invoices/${encodeURIComponent(payload.invoiceId)}/reject`, {
        reason: payload.reason,
      })
    },
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: billingAdminQueryKeys.all })
      toast.success('发票申请已驳回')
      onOpenChange(false)
    },
  })

  const formError =
    validationError ?? (mutation.error ? formatAdminApiError(mutation.error) : null)

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent className="w-full sm:max-w-md">
        <SheetHeader>
          <SheetTitle className="admin-display text-lg">驳回发票申请</SheetTitle>
          <SheetDescription>驳回原因将写入 adminRemark 并通知用户。</SheetDescription>
        </SheetHeader>

        {invoice ? (
          <dl className="space-y-3 border-y border-border/60 px-4 py-4 text-sm">
            <div className="flex flex-wrap items-center justify-between gap-2">
              <dt className="text-muted-foreground">订单号</dt>
              <dd>
                <AdminIdCell value={invoice.orderNo} label="订单号" />
              </dd>
            </div>
            <div className="flex flex-wrap items-center justify-between gap-2">
              <dt className="text-muted-foreground">抬头</dt>
              <dd className="max-w-[220px] truncate font-medium">{invoice.title}</dd>
            </div>
            <div className="flex flex-wrap items-center justify-between gap-2">
              <dt className="text-muted-foreground">金额</dt>
              <dd className="font-medium tabular-nums">
                {formatBillingPrice(invoice.amountCents, invoice.currency)}
              </dd>
            </div>
          </dl>
        ) : null}

        <form
          className="flex flex-1 flex-col gap-4 px-4"
          onSubmit={(event) => {
            event.preventDefault()
            setValidationError(null)
            if (!invoice) {
              setValidationError('未选择发票申请')
              return
            }
            const trimmed = reason.trim()
            if (!trimmed) {
              setValidationError('请填写驳回原因')
              return
            }
            mutation.mutate({ invoiceId: invoice.id, reason: trimmed })
          }}
        >
          <AdminField label="驳回原因" htmlFor={reasonInputId}>
            <Input
              id={reasonInputId}
              value={reason}
              onChange={(event) => setReason(event.target.value)}
              required
            />
          </AdminField>
          <AdminFormError message={formError} />
          <SheetFooter className="px-0">
            <Button
              type="submit"
              variant="destructive"
              disabled={!invoice || mutation.isPending}
            >
              {mutation.isPending ? '提交中…' : '确认驳回'}
            </Button>
          </SheetFooter>
        </form>
      </SheetContent>
    </Sheet>
  )
}
