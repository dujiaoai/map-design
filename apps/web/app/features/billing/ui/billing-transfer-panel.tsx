import { Button, Input } from '@repo/ui'
import { useId, useState } from 'react'

import { formatPoints } from '~/features/billing/lib/format-points'
import { useBillingTransferMutation } from '~/features/billing/model/use-billing-transfer-mutation'
import { useWalletQuery } from '~/shared/queries/billing-queries'

export function BillingTransferPanel() {
  const toUserIdInputId = useId()
  const amountInputId = useId()
  const remarkInputId = useId()

  const walletQuery = useWalletQuery()
  const mutation = useBillingTransferMutation()

  const [toUserId, setToUserId] = useState('')
  const [amount, setAmount] = useState('')
  const [remark, setRemark] = useState('')

  const formError =
    mutation.error instanceof Error
      ? mutation.error.message
      : mutation.isError
        ? '划拨失败，请稍后重试'
        : null

  return (
    <section className="rounded-xl border border-border/60 bg-card p-5 shadow-sm">
      <div className="space-y-1">
        <h2 className="text-base font-medium">向成员划拨积分</h2>
        <p className="text-muted-foreground text-sm">
          从您的个人账户扣减并转入目标成员；可用余额{' '}
          {walletQuery.data ? formatPoints(walletQuery.data.availableBalance) : '—'}。
        </p>
      </div>

      <form
        className="mt-4 space-y-4"
        onSubmit={(event) => {
          event.preventDefault()
          mutation.mutate({
            toUserId,
            amount: Number(amount),
            remark: remark || undefined,
          })
        }}
      >
        <div className="space-y-2">
          <label className="text-sm font-medium" htmlFor={toUserIdInputId}>
            成员用户 ID
          </label>
          <Input
            id={toUserIdInputId}
            value={toUserId}
            onChange={(event) => setToUserId(event.target.value)}
            placeholder="00000000-0000-0000-0000-000000000002"
            required
          />
        </div>
        <div className="space-y-2">
          <label className="text-sm font-medium" htmlFor={amountInputId}>
            划拨点数
          </label>
          <Input
            id={amountInputId}
            type="number"
            min={1}
            value={amount}
            onChange={(event) => setAmount(event.target.value)}
            required
          />
        </div>
        <div className="space-y-2">
          <label className="text-sm font-medium" htmlFor={remarkInputId}>
            备注（可选）
          </label>
          <Input
            id={remarkInputId}
            value={remark}
            onChange={(event) => setRemark(event.target.value)}
            placeholder="team allocation"
          />
        </div>

        {formError ? <p className="text-destructive text-sm">{formError}</p> : null}

        {mutation.data ? (
          <p className="text-muted-foreground text-sm">
            {mutation.data.idempotentReplay ? '幂等重放：' : '划拨成功：'}
            转出 {formatPoints(mutation.data.amount)}，您的余额{' '}
            {formatPoints(mutation.data.fromBalanceAfter)}。
          </p>
        ) : null}

        <Button type="submit" disabled={mutation.isPending}>
          {mutation.isPending ? '提交中…' : '确认划拨'}
        </Button>
      </form>
    </section>
  )
}
