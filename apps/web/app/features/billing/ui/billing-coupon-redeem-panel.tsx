import { Button, Card, CardContent, CardDescription, CardHeader, CardTitle, Input } from '@repo/ui'
import { TicketIcon } from 'lucide-react'
import { useId, useState } from 'react'

import { formatPoints } from '~/features/billing/lib/format-points'
import { useRedeemCouponMutation } from '~/features/billing/model/use-billing-coupon-mutation'

export function BillingCouponRedeemPanel() {
  const codeInputId = useId()
  const redeemCoupon = useRedeemCouponMutation()
  const [code, setCode] = useState('')
  const [successMessage, setSuccessMessage] = useState<string | null>(null)
  const [errorMessage, setErrorMessage] = useState<string | null>(null)

  async function handleSubmit(event: React.FormEvent) {
    event.preventDefault()
    setSuccessMessage(null)
    setErrorMessage(null)

    const trimmed = code.trim()
    if (!trimmed) {
      setErrorMessage('请输入兑换码')
      return
    }

    try {
      const result = await redeemCoupon.mutateAsync(trimmed)
      setCode('')
      setSuccessMessage(
        result.idempotentReplay
          ? `兑换码 ${result.code} 已兑换过，当前可用 ${formatPoints(result.walletBalance)} 点。`
          : `兑换成功，获得 ${formatPoints(result.points)} 点；当前可用 ${formatPoints(result.walletBalance)} 点。`,
      )
    } catch {
      setErrorMessage('兑换失败，请检查兑换码是否有效、未过期或已达上限。')
    }
  }

  return (
    <Card className="border-border/60 bg-card/80">
      <CardHeader>
        <CardTitle className="flex items-center gap-2 text-base">
          <TicketIcon className="size-4 text-primary" />
          优惠券兑换
        </CardTitle>
        <CardDescription>输入平台发放的兑换码，积分将直接进入您的个人账户。</CardDescription>
      </CardHeader>
      <CardContent>
        <form className="flex flex-col gap-3 sm:flex-row sm:items-end" onSubmit={handleSubmit}>
          <div className="flex-1 space-y-2">
            <label htmlFor={codeInputId} className="text-sm font-medium">
              兑换码
            </label>
            <Input
              id={codeInputId}
              value={code}
              onChange={(event) => setCode(event.target.value.toUpperCase())}
              placeholder="WELCOME100"
              autoComplete="off"
            />
          </div>
          <Button type="submit" disabled={redeemCoupon.isPending}>
            {redeemCoupon.isPending ? '兑换中…' : '立即兑换'}
          </Button>
        </form>
        {successMessage ? (
          <p className="mt-3 rounded-md border border-primary/30 bg-primary/10 px-3 py-2 text-sm text-primary">
            {successMessage}
          </p>
        ) : null}
        {errorMessage ? <p className="text-destructive mt-3 text-sm">{errorMessage}</p> : null}
      </CardContent>
    </Card>
  )
}
