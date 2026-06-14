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
  useConfirmDialog,
} from '@repo/ui'
import { useMutation, useQueryClient } from '@tanstack/react-query'
import { useEffect, useId, useRef, useState } from 'react'

import type { AdminRechargeOrder } from '~/features/billing/lib/billing-admin-api'
import { adminRefundResponseSchema } from '~/features/billing/lib/billing-admin-api'
import { formatBillingPrice } from '~/features/billing/lib/billing-format'
import { billingAdminQueryKeys } from '~/features/billing/lib/billing-admin-query-keys'
import { billingAdminApi } from '~/shared/api/billing-admin-client'
import { formatAdminApiError } from '~/shared/lib/format-admin-api-error'
import { AdminField, AdminFormError } from '~/shared/ui/admin-field'
import { AdminIdCell } from '~/shared/ui/admin-id-cell'

export function BillingRechargeRefundSheet({
  order,
  open,
  onOpenChange,
}: {
  order: AdminRechargeOrder | null
  open: boolean
  onOpenChange: (open: boolean) => void
}) {
  const queryClient = useQueryClient()
  const { confirm, confirmDialog } = useConfirmDialog()
  const reasonInputId = useId()
  const [reason, setReason] = useState('')
  const [validationError, setValidationError] = useState<string | null>(null)
  const idempotencyKeyRef = useRef<string | null>(null)

  useEffect(() => {
    if (open && order?.orderNo) {
      idempotencyKeyRef.current = `admin-refund:${order.orderNo}:${crypto.randomUUID()}`
      setReason('')
      setValidationError(null)
    }
  }, [open, order?.orderNo])

  const mutation = useMutation({
    mutationFn: async (payload: { orderNo: string; reason: string; idempotencyKey: string }) => {
      return adminRefundResponseSchema.parse(
        await billingAdminApi.post(
          `/recharge-orders/${encodeURIComponent(payload.orderNo)}/refund`,
          {
            reason: payload.reason,
            idempotencyKey: payload.idempotencyKey,
          },
        ),
      )
    },
    onSuccess: async (data) => {
      await queryClient.invalidateQueries({ queryKey: billingAdminQueryKeys.all })
      toast.success(`订单 ${data.orderNo} 已退款，扣回 ${data.pointsRefunded.toLocaleString('zh-CN')} 点`)
      onOpenChange(false)
    },
  })

  const formError =
    validationError ?? (mutation.error ? formatAdminApiError(mutation.error) : null)

  return (
    <>
      <Sheet open={open} onOpenChange={onOpenChange}>
        <SheetContent className="w-full sm:max-w-md">
          <SheetHeader>
            <SheetTitle className="admin-display text-lg">充值退款</SheetTitle>
            <SheetDescription>扣回积分并标记订单为已退款，操作不可撤销。</SheetDescription>
          </SheetHeader>

          {order ? (
            <dl className="space-y-3 border-y border-border/60 px-4 py-4 text-sm">
              <div className="flex flex-wrap items-center justify-between gap-2">
                <dt className="text-muted-foreground">订单号</dt>
                <dd>
                  <AdminIdCell value={order.orderNo} label="订单号" />
                </dd>
              </div>
              <div className="flex flex-wrap items-center justify-between gap-2">
                <dt className="text-muted-foreground">租户 ID</dt>
                <dd>
                  <AdminIdCell value={order.tenantId} label="租户 ID" />
                </dd>
              </div>
              <div className="flex flex-wrap items-center justify-between gap-2">
                <dt className="text-muted-foreground">用户 ID</dt>
                <dd>
                  <AdminIdCell value={order.userId} label="用户 ID" />
                </dd>
              </div>
              <div className="flex flex-wrap items-center justify-between gap-2">
                <dt className="text-muted-foreground">扣回积分</dt>
                <dd className="font-medium tabular-nums">{order.points.toLocaleString('zh-CN')} 点</dd>
              </div>
              <div className="flex flex-wrap items-center justify-between gap-2">
                <dt className="text-muted-foreground">原支付金额</dt>
                <dd className="font-medium tabular-nums">
                  {formatBillingPrice(order.priceCents, order.currency)}
                </dd>
              </div>
            </dl>
          ) : null}

          <form
            className="flex flex-1 flex-col gap-4 px-4"
            onSubmit={async (event) => {
              event.preventDefault()
              setValidationError(null)

              if (!order) {
                setValidationError('未选择订单')
                return
              }

              const trimmed = reason.trim()
              if (!trimmed) {
                setValidationError('请填写退款原因')
                return
              }

              const confirmed = await confirm({
                title: '确认充值退款',
                description: `订单 ${order.orderNo}\n扣回 ${order.points.toLocaleString('zh-CN')} 点（${formatBillingPrice(order.priceCents, order.currency)}）\n原因：${trimmed}`,
                confirmLabel: '确认退款',
                destructive: true,
              })
              if (!confirmed) return

              const idempotencyKey = idempotencyKeyRef.current
              if (!idempotencyKey) {
                setValidationError('幂等键未就绪，请关闭后重试')
                return
              }

              mutation.mutate({
                orderNo: order.orderNo,
                reason: trimmed,
                idempotencyKey,
              })
            }}
          >
            <AdminField label="退款原因" htmlFor={reasonInputId}>
              <Input
                id={reasonInputId}
                value={reason}
                onChange={(event) => setReason(event.target.value)}
                placeholder="customer_request / duplicate_charge / …"
                required
              />
            </AdminField>
            <AdminFormError message={formError} />
            <SheetFooter className="px-0">
              <Button
                type="submit"
                variant="destructive"
                disabled={!order || mutation.isPending}
              >
                {mutation.isPending ? '提交中…' : '提交退款'}
              </Button>
            </SheetFooter>
          </form>
        </SheetContent>
      </Sheet>
      {confirmDialog}
    </>
  )
}
