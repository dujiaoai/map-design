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

import type { AdminWireTransfer } from '~/features/billing/lib/billing-admin-api'
import { formatBillingPrice } from '~/features/billing/lib/billing-format'
import { billingAdminQueryKeys } from '~/features/billing/lib/billing-admin-query-keys'
import { billingAdminApi } from '~/shared/api/billing-admin-client'
import { formatAdminApiError } from '~/shared/lib/format-admin-api-error'
import { AdminField, AdminFormError } from '~/shared/ui/admin-field'
import { AdminIdCell } from '~/shared/ui/admin-id-cell'

export function BillingWireTransferRejectSheet({
  transfer,
  open,
  onOpenChange,
}: {
  transfer: AdminWireTransfer | null
  open: boolean
  onOpenChange: (open: boolean) => void
}) {
  const queryClient = useQueryClient()
  const reasonInputId = useId()
  const [reason, setReason] = useState('汇款凭证不符')
  const [validationError, setValidationError] = useState<string | null>(null)

  useEffect(() => {
    if (open) {
      setReason('汇款凭证不符')
      setValidationError(null)
    }
  }, [open, transfer?.id])

  const mutation = useMutation({
    mutationFn: async (payload: { requestId: string; reason: string }) => {
      await billingAdminApi.post(
        `/wire-transfers/${encodeURIComponent(payload.requestId)}/reject`,
        { reason: payload.reason },
      )
    },
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: billingAdminQueryKeys.all })
      toast.success('对公转账申请已驳回')
      onOpenChange(false)
    },
  })

  const formError =
    validationError ?? (mutation.error ? formatAdminApiError(mutation.error) : null)

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent className="w-full sm:max-w-md">
        <SheetHeader>
          <SheetTitle className="admin-display text-lg">驳回对公转账</SheetTitle>
          <SheetDescription>驳回后不会入账积分，原因将记录在申请单上。</SheetDescription>
        </SheetHeader>

        {transfer ? (
          <dl className="space-y-3 border-y border-border/60 px-4 py-4 text-sm">
            <div className="flex flex-wrap items-center justify-between gap-2">
              <dt className="text-muted-foreground">申请单号</dt>
              <dd>
                <AdminIdCell value={transfer.requestNo} label="申请单号" />
              </dd>
            </div>
            <div className="flex flex-wrap items-center justify-between gap-2">
              <dt className="text-muted-foreground">企业</dt>
              <dd className="max-w-[220px] truncate font-medium">{transfer.companyName}</dd>
            </div>
            <div className="flex flex-wrap items-center justify-between gap-2">
              <dt className="text-muted-foreground">汇款 / 积分</dt>
              <dd className="font-medium tabular-nums">
                {formatBillingPrice(transfer.amountCents, 'CNY')} ·{' '}
                {transfer.points.toLocaleString('zh-CN')} 点
              </dd>
            </div>
          </dl>
        ) : null}

        <form
          className="flex flex-1 flex-col gap-4 px-4"
          onSubmit={(event) => {
            event.preventDefault()
            setValidationError(null)
            if (!transfer) {
              setValidationError('未选择申请单')
              return
            }
            const trimmed = reason.trim()
            if (!trimmed) {
              setValidationError('请填写驳回原因')
              return
            }
            mutation.mutate({ requestId: transfer.id, reason: trimmed })
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
              disabled={!transfer || mutation.isPending}
            >
              {mutation.isPending ? '提交中…' : '确认驳回'}
            </Button>
          </SheetFooter>
        </form>
      </SheetContent>
    </Sheet>
  )
}
