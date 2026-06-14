import { Button, Input } from '@repo/ui'
import { useMutation } from '@tanstack/react-query'
import { useId, useState } from 'react'
import { z } from 'zod'

import { billingAdminApi } from '~/shared/api/billing-admin-client'
import { formatAdminApiError } from '~/shared/lib/format-admin-api-error'
import { AdminField, AdminFormError } from '~/shared/ui/admin-field'
import { AdminPanel } from '~/shared/ui/admin-page-shell'

const adjustResponseSchema = z.object({
  walletId: z.string(),
  tenantId: z.string(),
  userId: z.string(),
  amount: z.number(),
  balanceAfter: z.number(),
  remark: z.string(),
  idempotentReplay: z.boolean(),
})

type AdjustResponse = z.infer<typeof adjustResponseSchema>

function createIdempotencyKey() {
  return `admin-adjust:${crypto.randomUUID()}`
}

export function BillingAdjustPanel() {
  const tenantIdInputId = useId()
  const userIdInputId = useId()
  const amountInputId = useId()
  const remarkInputId = useId()

  const [tenantId, setTenantId] = useState('')
  const [userId, setUserId] = useState('')
  const [amount, setAmount] = useState('')
  const [remark, setRemark] = useState('')
  const [lastResult, setLastResult] = useState<AdjustResponse | null>(null)

  const mutation = useMutation({
    mutationFn: async () => {
      const parsedAmount = Number(amount)
      if (!Number.isFinite(parsedAmount) || parsedAmount === 0) {
        throw new Error('调账点数须为非零数字')
      }

      const payload = {
        userId: userId.trim(),
        amount: parsedAmount,
        remark: remark.trim(),
        idempotencyKey: createIdempotencyKey(),
      }

      return adjustResponseSchema.parse(
        await billingAdminApi.post<AdjustResponse>(
          `/tenants/${tenantId.trim()}/adjust`,
          payload,
        ),
      )
    },
    onSuccess: (data) => {
      setLastResult(data)
    },
  })

  const formError = mutation.error ? formatAdminApiError(mutation.error) : null

  return (
    <AdminPanel className="max-w-2xl">
      <div className="space-y-5 border-b border-border/60 px-6 py-5">
        <div>
          <h3 className="text-base font-medium">平台人工调账</h3>
          <p className="mt-1 text-sm text-muted-foreground">
            用于企业预付、赠送或冲正；积分进入目标用户个人账户。正数为入账，负数为扣减。
          </p>
        </div>
        <form
          className="space-y-4"
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
          <Button type="submit" disabled={mutation.isPending}>
            {mutation.isPending ? '提交中…' : '确认调账'}
          </Button>
        </form>
      </div>
      {lastResult ? (
        <div className="space-y-2 px-6 py-5 text-sm">
          <p className="font-medium text-foreground">
            {lastResult.idempotentReplay ? '幂等重放' : '调账成功'}
          </p>
          <p className="text-muted-foreground">
            变动 {lastResult.amount} 点，余额 {lastResult.balanceAfter} 点
          </p>
          <p className="text-muted-foreground">备注：{lastResult.remark}</p>
        </div>
      ) : null}
    </AdminPanel>
  )
}
