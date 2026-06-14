import { useState } from 'react'

import type { AdminPackage } from '~/features/billing/lib/billing-admin-api'
import { BillingAdjustPanel } from '~/features/billing/ui/billing-adjust-panel'
import { CreateBillingPackageSheet } from '~/features/billing/ui/create-billing-package-sheet'
import { EditBillingPackageSheet } from '~/features/billing/ui/edit-billing-package-sheet'
import { BillingPackagesPanel } from '~/features/billing/ui/billing-packages-panel'
import { BillingRechargeOrdersPanel } from '~/features/billing/ui/billing-recharge-orders-panel'
import { BillingStatsSummary } from '~/features/billing/ui/billing-stats-summary'
import { BillingUsagePanel } from '~/features/billing/ui/billing-usage-panel'
import { BillingWalletsPanel } from '~/features/billing/ui/billing-wallets-panel'
import { useAdminPermissions } from '~/shared/hooks/use-admin-permissions'
import { AdminEmptyState, AdminPageHeader, AdminPanel } from '~/shared/ui/admin-page-shell'

export function BillingAdminPage() {
  const { can } = useAdminPermissions()
  const canRead = can('admin:billing:read')
  const canAdjust = can('admin:billing:adjust')
  const canWritePackages = can('admin:billing:packages:write')
  const canRefund = can('admin:billing:refund')
  const [createPackageOpen, setCreatePackageOpen] = useState(false)
  const [editingPackage, setEditingPackage] = useState<AdminPackage | null>(null)

  const hasAnyBillingCapability = canRead || canAdjust || canWritePackages || canRefund

  return (
    <div className="space-y-6">
      <AdminPageHeader
        title="计费"
        description="平台钱包、充值订单、SKU 与人工调账；支持 mock 渠道订单退款（dev）。"
      />
      {!hasAnyBillingCapability ? (
        <AdminPanel>
          <AdminEmptyState message="当前账号无计费相关权限（admin:billing:*）。" />
        </AdminPanel>
      ) : null}
      {canRead ? (
        <>
          <BillingStatsSummary />
          <BillingPackagesPanel
            canWrite={canWritePackages}
            onCreatePackage={canWritePackages ? () => setCreatePackageOpen(true) : undefined}
            onEditPackage={(pkg) => setEditingPackage(pkg)}
          />
          <BillingWalletsPanel />
          <BillingRechargeOrdersPanel canRefund={canRefund} />
          <BillingUsagePanel />
        </>
      ) : null}
      {canAdjust ? <BillingAdjustPanel /> : null}
      {canWritePackages ? (
        <>
          <CreateBillingPackageSheet open={createPackageOpen} onOpenChange={setCreatePackageOpen} />
          <EditBillingPackageSheet
            pkg={editingPackage}
            open={editingPackage !== null}
            onOpenChange={(open) => {
              if (!open) setEditingPackage(null)
            }}
          />
        </>
      ) : null}
    </div>
  )
}
