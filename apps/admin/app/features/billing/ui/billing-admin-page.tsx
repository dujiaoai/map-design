import { Tabs, TabsContent, TabsList, TabsTrigger } from '@repo/ui'
import { useMemo, useState } from 'react'

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

type BillingTab = 'overview' | 'packages' | 'wallets' | 'orders' | 'usage' | 'adjust'

export function BillingAdminPage() {
  const { can } = useAdminPermissions()
  const canRead = can('admin:billing:read')
  const canAdjust = can('admin:billing:adjust')
  const canWritePackages = can('admin:billing:packages:write')
  const canRefund = can('admin:billing:refund')
  const [createPackageOpen, setCreatePackageOpen] = useState(false)
  const [editingPackage, setEditingPackage] = useState<AdminPackage | null>(null)

  const hasAnyBillingCapability = canRead || canAdjust || canWritePackages || canRefund

  const defaultTab = useMemo<BillingTab>(() => (canRead ? 'overview' : 'adjust'), [canRead])

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
      {hasAnyBillingCapability ? (
        <Tabs defaultValue={defaultTab} className="gap-4">
          <TabsList className="h-auto flex-wrap">
            {canRead ? (
              <>
                <TabsTrigger value="overview">概览</TabsTrigger>
                <TabsTrigger value="packages">充值 SKU</TabsTrigger>
                <TabsTrigger value="wallets">用户钱包</TabsTrigger>
                <TabsTrigger value="orders">充值订单</TabsTrigger>
                <TabsTrigger value="usage">消费汇总</TabsTrigger>
              </>
            ) : null}
            {canAdjust ? <TabsTrigger value="adjust">人工调账</TabsTrigger> : null}
          </TabsList>

          {canRead ? (
            <>
              <TabsContent value="overview" className="mt-4">
                <BillingStatsSummary />
              </TabsContent>
              <TabsContent value="packages" className="mt-4">
                <BillingPackagesPanel
                  canWrite={canWritePackages}
                  onCreatePackage={
                    canWritePackages ? () => setCreatePackageOpen(true) : undefined
                  }
                  onEditPackage={(pkg) => setEditingPackage(pkg)}
                />
              </TabsContent>
              <TabsContent value="wallets" className="mt-4">
                <BillingWalletsPanel />
              </TabsContent>
              <TabsContent value="orders" className="mt-4">
                <BillingRechargeOrdersPanel canRefund={canRefund} />
              </TabsContent>
              <TabsContent value="usage" className="mt-4">
                <BillingUsagePanel />
              </TabsContent>
            </>
          ) : null}

          {canAdjust ? (
            <TabsContent value="adjust" className="mt-4 space-y-6">
              <BillingAdjustPanel />
            </TabsContent>
          ) : null}
        </Tabs>
      ) : null}

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
