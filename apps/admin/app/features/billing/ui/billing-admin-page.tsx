import { Button, Tabs, TabsContent, TabsList, TabsTrigger } from '@repo/ui'
import { useQueryClient } from '@tanstack/react-query'
import { RefreshCwIcon } from 'lucide-react'
import { useCallback, useMemo, useState } from 'react'
import { Link, useSearchParams } from 'react-router'

import type { AdminPackage } from '~/features/billing/lib/billing-admin-api'
import {
  type BillingNavigateTarget,
  type BillingTab,
  parseBillingTab,
} from '~/features/billing/lib/billing-admin-nav'
import { billingAdminQueryKeys } from '~/features/billing/lib/billing-admin-query-keys'
import { BillingAdjustPanel } from '~/features/billing/ui/billing-adjust-panel'
import { CreateBillingPackageSheet } from '~/features/billing/ui/create-billing-package-sheet'
import { EditBillingPackageSheet } from '~/features/billing/ui/edit-billing-package-sheet'
import { BillingLedgerPanel } from '~/features/billing/ui/billing-ledger-panel'
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
  const queryClient = useQueryClient()
  const [searchParams, setSearchParams] = useSearchParams()

  const [createPackageOpen, setCreatePackageOpen] = useState(false)
  const [editingPackage, setEditingPackage] = useState<AdminPackage | null>(null)
  const [refreshing, setRefreshing] = useState(false)

  const canViewPackages = canRead || canWritePackages
  const canViewOrders = canRead || canRefund

  const hasAnyBillingCapability =
    canRead || canAdjust || canWritePackages || canRefund

  const defaultTab = useMemo<BillingTab>(() => {
    if (canRead) return 'overview'
    if (canWritePackages) return 'packages'
    if (canRefund) return 'orders'
    if (canAdjust) return 'adjust'
    return 'overview'
  }, [canRead, canWritePackages, canRefund, canAdjust])

  const activeTab = parseBillingTab(searchParams.get('tab'), defaultTab)

  const filterSeed = useMemo(
    () => ({
      tenantId: searchParams.get('tenantId')?.trim() || undefined,
      userId: searchParams.get('userId')?.trim() || undefined,
    }),
    [searchParams],
  )

  const navigateBilling = useCallback(
    ({ tab, tenantId, userId }: BillingNavigateTarget) => {
      setSearchParams(
        (prev) => {
          const next = new URLSearchParams(prev)
          next.set('tab', tab)
          if (tenantId) next.set('tenantId', tenantId)
          else next.delete('tenantId')
          if (userId) next.set('userId', userId)
          else next.delete('userId')
          return next
        },
        { replace: true },
      )
    },
    [setSearchParams],
  )

  const setActiveTab = useCallback(
    (tab: string) => {
      navigateBilling({ tab: tab as BillingTab })
    },
    [navigateBilling],
  )

  async function refreshBillingData() {
    setRefreshing(true)
    try {
      await queryClient.invalidateQueries({ queryKey: billingAdminQueryKeys.all })
    } finally {
      setRefreshing(false)
    }
  }

  return (
    <div className="space-y-6">
      <AdminPageHeader
        title="计费"
        description="平台钱包、充值 SKU、订单与用量；人工调账与退款操作写入审计日志。"
        actions={
          hasAnyBillingCapability ? (
            <>
              <Button
                nativeButton={false}
                variant="outline"
                size="sm"
                render={<Link to="/audit-logs" />}
              >
                审计日志
              </Button>
              <Button
                type="button"
                variant="outline"
                size="sm"
                disabled={refreshing}
                onClick={() => void refreshBillingData()}
              >
                <RefreshCwIcon className={refreshing ? 'animate-spin' : undefined} />
                刷新
              </Button>
            </>
          ) : null
        }
      />
      {!hasAnyBillingCapability ? (
        <AdminPanel>
          <AdminEmptyState message="当前账号无计费相关权限（admin:billing:*）。" />
        </AdminPanel>
      ) : null}
      {hasAnyBillingCapability ? (
        <Tabs value={activeTab} onValueChange={setActiveTab} className="gap-4">
          <TabsList className="h-auto flex-wrap">
            {canRead ? (
              <>
                <TabsTrigger value="overview">概览</TabsTrigger>
                <TabsTrigger value="wallets">用户钱包</TabsTrigger>
                <TabsTrigger value="ledger">积分流水</TabsTrigger>
                <TabsTrigger value="usage">消费汇总</TabsTrigger>
              </>
            ) : null}
            {canViewPackages ? <TabsTrigger value="packages">充值 SKU</TabsTrigger> : null}
            {canViewOrders ? <TabsTrigger value="orders">充值订单</TabsTrigger> : null}
            {canAdjust ? <TabsTrigger value="adjust">人工调账</TabsTrigger> : null}
          </TabsList>

          {canRead ? (
            <>
              <TabsContent value="overview" className="mt-4">
                <BillingStatsSummary onNavigate={navigateBilling} />
              </TabsContent>
              <TabsContent value="wallets" className="mt-4">
                <BillingWalletsPanel
                  filterSeed={filterSeed}
                  onNavigate={navigateBilling}
                />
              </TabsContent>
              <TabsContent value="ledger" className="mt-4">
                <BillingLedgerPanel filterSeed={filterSeed} />
              </TabsContent>
              <TabsContent value="usage" className="mt-4">
                <BillingUsagePanel filterSeed={filterSeed} />
              </TabsContent>
            </>
          ) : null}

          {canViewPackages ? (
            <TabsContent value="packages" className="mt-4">
              <BillingPackagesPanel
                canWrite={canWritePackages}
                onCreatePackage={
                  canWritePackages ? () => setCreatePackageOpen(true) : undefined
                }
                onEditPackage={(pkg) => setEditingPackage(pkg)}
              />
            </TabsContent>
          ) : null}

          {canViewOrders ? (
            <TabsContent value="orders" className="mt-4">
              <BillingRechargeOrdersPanel
                canRefund={canRefund}
                filterSeed={filterSeed}
              />
            </TabsContent>
          ) : null}

          {canAdjust ? (
            <TabsContent value="adjust" className="mt-4 space-y-6">
              <BillingAdjustPanel filterSeed={filterSeed} />
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
