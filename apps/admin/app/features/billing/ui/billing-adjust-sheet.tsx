import {
  Button,
  Input,
  Sheet,
  SheetContent,
  SheetDescription,
  SheetFooter,
  SheetHeader,
  SheetTitle,
  useConfirmDialog,
} from '@repo/ui'
import { useMutation, useQueryClient } from '@tanstack/react-query'
import { useEffect, useId, useState } from 'react'
import { z } from 'zod'

import { billingAdminQueryKeys } from '~/features/billing/lib/billing-admin-query-keys'
import { billingAdminApi } from '~/shared/api/billing-admin-client'
import { formatAdminApiError } from '~/shared/lib/format-admin-api-error'
import { validateOptionalUuidFilters } from '~/shared/lib/uuid'
import { AdminField, AdminFormError } from '~/shared/ui/admin-field'

const adjustResponseSchema = z.object({
  walletId: z.string(),
  tenantId: z.string(),
  userId: z.string(),
  amount: z.number(),
  balanceAfter: z.number(),
  remark: z.string(),
  idempotentReplay: z.boolean(),
})

export type BillingAdjustResult = z.infer<typeof adjustResponseSchema>

const MAX_ADJUST_ABS_POINTS = 1_000_000

function createIdempotencyKey() {
  return `admin-adjust:${crypto.randomUUID()}`
}

export function BillingAdjustSheet({
  open,
  onOpenChange,
  onSuccess,
}: {
  open: boolean
  onOpenChange: (open: boolean) => void
  onSuccess?: (result: BillingAdjustResult) => void
}) {
  const queryClient = useQueryClient()
  const { confirm, confirmDialog } = useConfirmDialog()
  const tenantIdInputId = useId()
  const userIdInputId = useId()
  const amountInputId = useId()
  const remarkInputId = useId()

  const [tenantId, setTenantId] = useState('')
  const [userId, setUserId] = useState('')
  const [amount, setAmount] = useState('')
  const [remark, setRemark] = useState('')
  const [validationError, setValidationError] = useState<string | null>(null)

  useEffect(() => {
    if (!open) {
      setTenantId('')
      setUserId('')
      setAmount('')
      setRemark('')
      setValidationError(null)
    }
  }, [open])

  const mutation = useMutation({
    mutationFn: async (payload: {
      tenantId: string
      userId: string
      amount: number
      remark: string
      idempotencyKey: string
    }) => {
      return adjustResponseSchema.parse(
        await billingAdminApi.post<BillingAdjustResult>(
          `/tenants/${payload.tenantId}/adjust`,
          {
            userId: payload.userId,
            amount: payload.amount,
            remark: payload.remark,
            idempotencyKey: payload.idempotencyKey,
          },
        ),
      )
    },
    onSuccess: async (data) => {
      await queryClient.invalidateQueries({ queryKey: billingAdminQueryKeys.all })
      onSuccess?.(data)
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
            <SheetTitle className="admin-display text-lg">平台人工调账</SheetTitle>
            <SheetDescription>
              用于企业预付、赠送或冲正；正数为入账，负数为扣减。
            </SheetDescription>
          </SheetHeader>

          <form
            className="flex flex-1 flex-col gap-4 px-4"
            onSubmit={async (event) => {
              event.preventDefault()
              setValidationError(null)

              const trimmedTenantId = tenantId.trim()
              const trimmedUserId = userId.trim()
              const trimmedRemark = remark.trim()
              const uuidError = validateOptionalUuidFilters({
                '租户 ID': trimmedTenantId,
                '用户 ID': trimmedUserId,
              })
              if (uuidError) {
                setValidationError(uuidError)
                return
              }

              const parsedAmount = Number(amount)
              if (!Number.isFinite(parsedAmount) || parsedAmount === 0) {
                setValidationError('调账点数须为非零数字')
                return
              }
              if (Math.abs(parsedAmount) > MAX_ADJUST_ABS_POINTS) {
                setValidationError(`单次调账绝对值不可超过 ${MAX_ADJUST_ABS_POINTS.toLocaleString('zh-CN')} 点`)
                return
              }
              if (!trimmedRemark) {
                setValidationError('请填写备注')
                return
              }

              const signedAmount =
                parsedAmount > 0 ? `+${parsedAmount.toLocaleString('zh-CN')}` : parsedAmount.toLocaleString('zh-CN')
              const confirmed = await confirm({
                title: '确认人工调账',
                description: `租户 ${trimmedTenantId}\n用户 ${trimmedUserId}\n调账 ${signedAmount} 点\n备注：${trimmedRemark}`,
                confirmLabel: '确认调账',
              })
              if (!confirmed) return

              mutation.mutate({
                tenantId: trimmedTenantId,
                userId: trimmedUserId,
                amount: parsedAmount,
                remark: trimmedRemark,
                idempotencyKey: createIdempotencyKey(),
              })
            }}
          >
            <AdminField label="租户 ID" htmlFor={tenantIdInputId}>
              <Input
                id={tenantIdInputId}
                value={tenantId}
                onChange={(event) => setTenantId(event.target.value)}
                placeholder="00000000-0000-0000-0000-000000000001"
                required
              />
            </AdminField>
            <AdminField label="用户 ID" htmlFor={userIdInputId}>
              <Input
                id={userIdInputId}
                value={userId}
                onChange={(event) => setUserId(event.target.value)}
                placeholder="目标成员 UUID"
                required
              />
            </AdminField>
            <AdminField label="调账点数" htmlFor={amountInputId}>
              <Input
                id={amountInputId}
                type="number"
                value={amount}
                onChange={(event) => setAmount(event.target.value)}
                placeholder="例如 500 或 -100"
                required
              />
            </AdminField>
            <AdminField label="备注" htmlFor={remarkInputId}>
              <Input
                id={remarkInputId}
                value={remark}
                onChange={(event) => setRemark(event.target.value)}
                placeholder="enterprise_prepay / gift / correction"
                required
              />
            </AdminField>
            <AdminFormError message={formError} />
            <SheetFooter className="px-0">
              <Button type="submit" disabled={mutation.isPending}>
                {mutation.isPending ? '提交中…' : '提交调账'}
              </Button>
            </SheetFooter>
          </form>
        </SheetContent>
      </Sheet>
      {confirmDialog}
    </>
  )
}
