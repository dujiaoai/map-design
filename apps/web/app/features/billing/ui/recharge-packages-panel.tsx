import {
  Button,
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
  Input,
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
  Skeleton,
} from '@repo/ui'
import { useMemo, useState } from 'react'

import {
  defaultPaySceneForChannel,
  payScenesForChannel,
  RECHARGE_CHANNELS,
  type RechargeChannel,
  type RechargePayScene,
} from '~/features/billing/lib/payment-channel-options'
import {
  classifyRechargePayLaunch,
  openRechargePayUrl,
  rechargePayLaunchHint,
} from '~/features/billing/lib/open-recharge-pay-url'
import {
  useCancelRechargeOrderMutation,
  useCreateRechargeOrderMutation,
  useMockPayRechargeOrderMutation,
  type RechargeOrderResponse,
} from '~/features/billing/model/use-billing-recharge-mutations'
import { formatPoints } from '~/features/billing/lib/format-points'
import { formatPriceCents } from '~/features/billing/lib/format-price'
import { useRechargePackagesQuery } from '~/shared/queries/billing-queries'

const PACKAGE_LABELS: Record<string, string> = {
  starter_500: '体验包',
  standard_2000: '标准包',
  pro_5000: '专业包',
}

export function RechargePackagesPanel({
  onPaidOrder,
}: {
  onPaidOrder?: (orderNo: string) => void
}) {
  const packagesQuery = useRechargePackagesQuery()
  const createOrder = useCreateRechargeOrderMutation()
  const mockPay = useMockPayRechargeOrderMutation()
  const cancelOrder = useCancelRechargeOrderMutation()
  const [pendingOrder, setPendingOrder] = useState<RechargeOrderResponse | null>(null)
  const [couponCode, setCouponCode] = useState('')
  const [channel, setChannel] = useState<RechargeChannel>('mock')
  const [payScene, setPayScene] = useState<RechargePayScene>('native')
  const [paidMessage, setPaidMessage] = useState<string | null>(null)
  const [actionError, setActionError] = useState<string | null>(null)

  const paySceneOptions = useMemo(() => payScenesForChannel(channel), [channel])

  function handleChannelChange(nextChannel: RechargeChannel) {
    setChannel(nextChannel)
    const nextDefault = defaultPaySceneForChannel(nextChannel)
    if (nextDefault) {
      setPayScene(nextDefault)
    }
  }

  async function handleCreateOrder(packageCode: string) {
    setActionError(null)
    setPaidMessage(null)
    try {
      const order = await createOrder.mutateAsync({
        packageCode,
        channel,
        ...(couponCode.trim() ? { couponCode: couponCode.trim() } : {}),
        ...(channel !== 'mock' ? { payScene } : {}),
      })
      setPendingOrder(order)
    } catch {
      setActionError('创建订单失败，请稍后重试。')
    }
  }

  async function handleMockPay() {
    if (!pendingOrder) return
    setActionError(null)
    try {
      const result = await mockPay.mutateAsync(pendingOrder.orderNo)
      const paidOrderNo = pendingOrder.orderNo
      setPendingOrder(null)
      setPaidMessage(`充值成功，当前可用 ${formatPoints(result.walletBalance)} 点。`)
      onPaidOrder?.(paidOrderNo)
    } catch {
      setActionError('模拟支付失败，请重试或取消订单。')
    }
  }

  function handleOpenPayUrl() {
    if (!pendingOrder?.payUrl) return
    const opened = openRechargePayUrl(pendingOrder.payUrl)
    if (!opened) {
      setActionError('当前支付链接无法在新窗口打开，请复制下方链接手动访问。')
    }
  }

  async function handleCancelOrder() {
    if (!pendingOrder) return
    setActionError(null)
    try {
      await cancelOrder.mutateAsync(pendingOrder.orderNo)
      setPendingOrder(null)
    } catch {
      setActionError('取消订单失败，请刷新页面后重试。')
    }
  }

  const isBusy =
    createOrder.isPending || mockPay.isPending || cancelOrder.isPending

  const pendingPayLaunch = pendingOrder?.payUrl
    ? classifyRechargePayLaunch(pendingOrder.payUrl, pendingOrder.payScene)
    : null

  return (
    <Card className="border-border/60 bg-card/80">
      <CardHeader>
        <CardTitle className="text-base">充值套餐</CardTitle>
        <CardDescription>
          积分将进入您个人账户。可选择沙箱 mock、微信或支付宝（H5/扫码占位链路；正式 SDK 接入后自动调起）。
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        {paidMessage ? (
          <p className="rounded-md border border-primary/30 bg-primary/10 px-3 py-2 text-sm text-primary">
            {paidMessage}
          </p>
        ) : null}
        {actionError ? (
          <p className="text-destructive text-sm">{actionError}</p>
        ) : null}

        <div className="grid gap-4 sm:grid-cols-2">
          <div className="space-y-2">
            <label className="text-sm font-medium" htmlFor="recharge-channel">
              支付渠道
            </label>
            <Select
              value={channel}
              onValueChange={(value) => handleChannelChange((value ?? 'mock') as RechargeChannel)}
              disabled={isBusy || Boolean(pendingOrder)}
            >
              <SelectTrigger id="recharge-channel">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {RECHARGE_CHANNELS.map((item) => (
                  <SelectItem key={item.value} value={item.value}>
                    {item.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          {paySceneOptions.length > 0 ? (
            <div className="space-y-2">
              <label className="text-sm font-medium" htmlFor="recharge-pay-scene">
                支付场景
              </label>
              <Select
                value={payScene}
                onValueChange={(value) => setPayScene((value ?? payScene) as RechargePayScene)}
                disabled={isBusy || Boolean(pendingOrder)}
              >
                <SelectTrigger id="recharge-pay-scene">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {paySceneOptions.map((item) => (
                    <SelectItem key={item.value} value={item.value}>
                      {item.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          ) : null}
        </div>

        <div className="space-y-2">
          <label className="text-sm font-medium" htmlFor="recharge-coupon-code">
            抵扣券（可选）
          </label>
          <Input
            id="recharge-coupon-code"
            value={couponCode}
            onChange={(event) => setCouponCode(event.target.value.toUpperCase())}
            placeholder="充值抵扣券码"
            disabled={isBusy || Boolean(pendingOrder)}
          />
          <p className="text-muted-foreground text-xs">
            抵扣券在下单时减免应付金额；赠送积分券请使用下方「优惠券兑换」。
          </p>
        </div>

        {packagesQuery.isPending ? (
          <div className="grid gap-3 sm:grid-cols-3">
            <Skeleton className="h-28 w-full" />
            <Skeleton className="h-28 w-full" />
            <Skeleton className="h-28 w-full" />
          </div>
        ) : packagesQuery.isError ? (
          <p className="text-muted-foreground text-sm">暂时无法加载套餐，请稍后重试。</p>
        ) : (
          <div className="grid gap-3 sm:grid-cols-3">
            {packagesQuery.data.items.map((pkg) => (
              <div
                key={pkg.id}
                className="flex flex-col gap-3 rounded-lg border border-border/60 bg-muted/20 p-4"
              >
                <div>
                  <p className="font-medium">{PACKAGE_LABELS[pkg.code] ?? pkg.code}</p>
                  <p className="font-mono text-2xl font-semibold tabular-nums">
                    {formatPoints(pkg.points)}
                    <span className="text-muted-foreground ml-1 text-sm font-normal">点</span>
                  </p>
                  <p className="text-muted-foreground text-sm">{formatPriceCents(pkg.priceCents)}</p>
                </div>
                <Button
                  type="button"
                  size="sm"
                  className="mt-auto w-full"
                  disabled={isBusy || Boolean(pendingOrder)}
                  onClick={() => void handleCreateOrder(pkg.code)}
                >
                  立即充值
                </Button>
              </div>
            ))}
          </div>
        )}

        {pendingOrder ? (
          <div className="rounded-lg border border-border/60 bg-muted/10 p-4 space-y-3">
            <div>
              <p className="font-medium">待支付订单</p>
              <p className="text-muted-foreground text-sm">
                订单号 {pendingOrder.orderNo} · {formatPoints(pendingOrder.points)} 点 ·{' '}
                {pendingOrder.couponDiscountCents > 0 ? (
                  <>
                    原价 {formatPriceCents(pendingOrder.listPriceCents)}，抵扣{' '}
                    {formatPriceCents(pendingOrder.couponDiscountCents)}，应付{' '}
                    {formatPriceCents(pendingOrder.priceCents)}
                  </>
                ) : (
                  formatPriceCents(pendingOrder.priceCents)
                )}
              </p>
              {pendingOrder.couponCode ? (
                <p className="text-muted-foreground text-xs">已使用抵扣券 {pendingOrder.couponCode}</p>
              ) : null}
              {pendingOrder.payScene ? (
                <p className="text-muted-foreground text-xs">
                  支付场景 {pendingOrder.channel} / {pendingOrder.payScene}
                </p>
              ) : null}
              {pendingOrder.payUrl ? (
                <p className="text-muted-foreground mt-1 break-all font-mono text-xs">
                  {pendingOrder.payUrl}
                </p>
              ) : null}
              {pendingPayLaunch ? (
                <p className="text-muted-foreground mt-2 text-xs">
                  {rechargePayLaunchHint(pendingPayLaunch)}
                </p>
              ) : null}
            </div>
            <div className="flex flex-wrap gap-2">
              {pendingOrder.channel === 'mock' ? (
                <Button type="button" disabled={isBusy} onClick={() => void handleMockPay()}>
                  模拟支付完成
                </Button>
              ) : pendingPayLaunch === 'http' ? (
                <Button type="button" disabled={isBusy} onClick={handleOpenPayUrl}>
                  前往支付
                </Button>
              ) : null}
              <Button
                type="button"
                variant="outline"
                disabled={isBusy}
                onClick={() => void handleCancelOrder()}
              >
                取消订单
              </Button>
            </div>
          </div>
        ) : null}
      </CardContent>
    </Card>
  )
}
