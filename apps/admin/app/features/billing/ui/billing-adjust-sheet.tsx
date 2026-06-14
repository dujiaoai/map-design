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
import { z } from 'zod'

import { billingAdminQueryKeys } from '~/features/billing/lib/billing-admin-query-keys'
import { billingAdminApi } from '~/shared/api/billing-admin-client'
import { formatAdminApiError } from '~/shared/lib/format-admin-api-error'
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
  const tenantIdInputId = useId()
  const userIdInputId = useId()
  const amountInputId = useId()
  const remarkInputId = useId()

  const [tenantId, setTenantId] = useState('')
  const [userId, setUserId] = useState('')
  const [amount, setAmount] = useState('')
  const [remark, setRemark] = useState('')

  useEffect(() => {
    if (!open) {
      setTenantId('')
      setUserId('')
      setAmount('')
      setRemark('')
    }
  }, [open])

  const mutation = useMutation({
    mutationFn: async () => {
      const parsedAmount = Number(amount)
      if (!Number.isFinite(parsedAmount) || parsedAmount === 0) {
        throw new Error('调账点数须为非零数字')
      }

      return adjustResponseSchema.parse(
        await billingAdminApi.post<BillingAdjustResult>(
          `/tenants/${tenantId.trim()}/adjust`,
          {
            userId: userId.trim(),
            amount: parsedAmount,
            remark: remark.trim(),
            idempotencyKey: createIdempotencyKey(),
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

  const formError = mutation.error ? formatAdminApiError(mutation.error) : null

  return (
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
          onSubmit={(event) => {
            event.preventDefault()
            mutation.mutate()
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
              {mutation.isPending ? '提交中…' : '确认调账'}
            </Button>
          </SheetFooter>
        </form>
      </SheetContent>
    </Sheet>
  )
}
