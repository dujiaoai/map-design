import { hasPermission, PermissionCodes } from '@repo/auth'
import { Button, Card, CardContent, CardDescription, CardHeader, CardTitle } from '@repo/ui'
import { ArrowLeftIcon, CreditCardIcon, ScrollTextIcon } from 'lucide-react'
import { Link } from 'react-router'

import { BillingWalletCard } from '~/features/billing/ui/billing-wallet-card'
import { auth } from '~/shared/auth/client'

export function BillingPageContent() {
  const canRecharge = hasPermission(
    auth.getSession()?.user.permissions,
    PermissionCodes.BILLING_RECHARGE_CREATE,
  )
  const canReadLedger = hasPermission(
    auth.getSession()?.user.permissions,
    PermissionCodes.BILLING_LEDGER_READ,
  )

  return (
    <div className="mx-auto flex w-full max-w-2xl flex-col gap-6 px-4 py-8 sm:px-6">
      <div className="flex items-center gap-3">
        <Button
          nativeButton={false}
          variant="ghost"
          size="icon-sm"
          render={<Link to="/" aria-label="返回工作台" />}
        >
          <ArrowLeftIcon className="size-4" />
        </Button>
        <div>
          <h1 className="text-xl font-semibold tracking-tight">积分与计费</h1>
          <p className="text-muted-foreground text-sm">查看余额、充值与消费流水</p>
        </div>
      </div>

      <BillingWalletCard variant="page" />

      <div className="grid gap-4 sm:grid-cols-2">
        <Card className="border-border/60 bg-card/60">
          <CardHeader className="pb-2">
            <CardTitle className="flex items-center gap-2 text-base">
              <CreditCardIcon className="size-4 text-primary" />
              充值
            </CardTitle>
            <CardDescription>
              {canRecharge
                ? '微信 / 支付宝充值套餐将在 Sprint F-2 开放。'
                : '当前角色暂无自助充值权限，请联系租户管理员。'}
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Button type="button" disabled className="w-full sm:w-auto">
              即将上线
            </Button>
          </CardContent>
        </Card>

        <Card className="border-border/60 bg-card/60">
          <CardHeader className="pb-2">
            <CardTitle className="flex items-center gap-2 text-base">
              <ScrollTextIcon className="size-4 text-primary" />
              消费流水
            </CardTitle>
            <CardDescription>
              {canReadLedger
                ? '积分入账与扣减明细将在 Sprint F-3 提供列表查询。'
                : '当前角色无法查看流水明细。'}
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Button type="button" variant="outline" disabled className="w-full sm:w-auto">
              即将上线
            </Button>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
