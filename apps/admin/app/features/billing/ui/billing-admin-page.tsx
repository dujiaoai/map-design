import { BillingAdjustPanel } from '~/features/billing/ui/billing-adjust-panel'
import { BillingPackagesPanel } from '~/features/billing/ui/billing-packages-panel'
import { BillingRechargeOrdersPanel } from '~/features/billing/ui/billing-recharge-orders-panel'
import { BillingStatsSummary } from '~/features/billing/ui/billing-stats-summary'
import { BillingWalletsPanel } from '~/features/billing/ui/billing-wallets-panel'
import { useAdminPermissions } from '~/shared/hooks/use-admin-permissions'
import { AdminPageHeader } from '~/shared/ui/admin-page-shell'

export function BillingAdminPage() {
  const { can } = useAdminPermissions()
  const canRead = can('admin:billing:read')
  const canAdjust = can('admin:billing:adjust')

  return (
    <div className="space-y-6">
      <AdminPageHeader
        title="计费"
        description="平台钱包查询、充值订单与人工调账（B2B 过渡 SOP）。"
      />
      {canRead ? (
        <>
          <BillingStatsSummary />
          <BillingPackagesPanel />
          <div className="grid gap-6 xl:grid-cols-2">
            <BillingWalletsPanel />
            <BillingRechargeOrdersPanel />
          </div>
        </>
      ) : null}
      {canAdjust ? <BillingAdjustPanel /> : null}
    </div>
  )
}
