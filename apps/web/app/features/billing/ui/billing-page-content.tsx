import { hasPermission, PermissionCodes } from '@repo/auth'
import { Button } from '@repo/ui'
import { ArrowLeftIcon } from 'lucide-react'
import { useState } from 'react'
import { Link } from 'react-router'

import { canMemberSelfRecharge } from '~/features/billing/lib/member-recharge-policy'
import { DevBillingSmokePanel } from '~/features/billing/ui/dev-billing-smoke-panel'
import { BillingInvoicesPanel } from '~/features/billing/ui/billing-invoices-panel'
import { BillingLedgerTable } from '~/features/billing/ui/billing-ledger-table'
import { BillingTransferPanel } from '~/features/billing/ui/billing-transfer-panel'
import { BillingUsageSummary } from '~/features/billing/ui/billing-usage-summary'
import { BillingWalletCard } from '~/features/billing/ui/billing-wallet-card'
import { RechargePackagesPanel } from '~/features/billing/ui/recharge-packages-panel'
import { auth } from '~/shared/auth/client'
import { useEnabledTenantFeatures } from '~/features/team-switcher'

export function BillingPageContent() {
  const session = auth.getSession()
  const enabledTenantFeatures = useEnabledTenantFeatures()
  const [invoiceRequestOrderNo, setInvoiceRequestOrderNo] = useState<string | null>(null)
  const canRechargePermission = hasPermission(
    session?.user.permissions,
    PermissionCodes.BILLING_RECHARGE_CREATE,
  )
  const canRecharge =
    canRechargePermission &&
    canMemberSelfRecharge(session?.user, enabledTenantFeatures)
  const canReadLedger = hasPermission(
    auth.getSession()?.user.permissions,
    PermissionCodes.BILLING_LEDGER_READ,
  )
  const canReadTeamUsage = hasPermission(
    auth.getSession()?.user.permissions,
    PermissionCodes.BILLING_USAGE_READ,
  )
  const canTransfer = hasPermission(
    auth.getSession()?.user.permissions,
    PermissionCodes.BILLING_TRANSFER_CREATE,
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

      {canRecharge ? <RechargePackagesPanel onPaidOrder={setInvoiceRequestOrderNo} /> : null}
      {canRecharge ? (
        <BillingInvoicesPanel
          requestOrderNo={invoiceRequestOrderNo}
          onClearRequestOrderNo={() => setInvoiceRequestOrderNo(null)}
        />
      ) : null}
      {canRechargePermission && !canRecharge ? (
        <p className="text-muted-foreground rounded-xl border border-border/60 bg-card p-5 text-sm">
          当前租户已关闭成员自助充值。请联系租户管理员划拨积分，或通过平台申请企业预付。
        </p>
      ) : null}

      {canTransfer ? <BillingTransferPanel /> : null}

      {canReadTeamUsage ? <BillingUsageSummary /> : null}

      {canReadLedger ? (
        <BillingLedgerTable />
      ) : (
        <p className="text-muted-foreground text-sm">当前角色无法查看积分流水。</p>
      )}
    </div>
  )
}
