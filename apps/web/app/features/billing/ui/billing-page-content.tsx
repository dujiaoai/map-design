import { hasPermission, PermissionCodes } from '@repo/auth'
import { Button } from '@repo/ui'
import { ArrowLeftIcon } from 'lucide-react'
import { Link } from 'react-router'

import { DevBillingSmokePanel } from '~/features/billing/ui/dev-billing-smoke-panel'
import { BillingLedgerTable } from '~/features/billing/ui/billing-ledger-table'
import { BillingUsageSummary } from '~/features/billing/ui/billing-usage-summary'
import { BillingWalletCard } from '~/features/billing/ui/billing-wallet-card'
import { RechargePackagesPanel } from '~/features/billing/ui/recharge-packages-panel'
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
  const canReadTeamUsage = hasPermission(
    auth.getSession()?.user.permissions,
    PermissionCodes.BILLING_USAGE_READ,
  )

  return (
    <div className="mx-auto flex w-full max-w-3xl flex-col gap-6 px-4 py-8 sm:px-6">
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

      <DevBillingSmokePanel />

      {canRecharge ? <RechargePackagesPanel /> : null}

      {canReadTeamUsage ? <BillingUsageSummary /> : null}

      {canReadLedger ? (
        <BillingLedgerTable />
      ) : (
        <p className="text-muted-foreground text-sm">当前角色无法查看积分流水。</p>
      )}
    </div>
  )
}
