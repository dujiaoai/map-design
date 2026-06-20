import { Button } from '@repo/ui'
import { useQueryClient } from '@tanstack/react-query'
import { RefreshCwIcon, ArrowLeftIcon } from 'lucide-react'
import { useCallback, useMemo, useState } from 'react'
import { Link, useSearchParams } from 'react-router'

import type { AdminPackage } from '~/features/billing/lib/billing-admin-api'
import {
  type BillingNavigateTarget,
  type BillingTab,
  parseBillingTab,
  resolveAccessibleBillingTab,
} from '~/features/billing/lib/billing-admin-nav'
import { billingAdminQueryKeys } from '~/features/billing/lib/billing-admin-query-keys'
import { BillingAdjustPanel } from '~/features/billing/ui/billing-adjust-panel'
import { BillingCouponsPanel } from '~/features/billing/ui/billing-coupons-panel'
import { BillingFilterSeedBanner } from '~/features/billing/ui/billing-filter-seed-banner'
import { CreateBillingPackageSheet } from '~/features/billing/ui/create-billing-package-sheet'
import { EditBillingPackageSheet } from '~/features/billing/ui/edit-billing-package-sheet'
import { BillingWireTransfersPanel } from '~/features/billing/ui/billing-wire-transfers-panel'
import { BillingInvoicesPanel } from '~/features/billing/ui/billing-invoices-panel'
import { BillingLedgerPanel } from '~/features/billing/ui/billing-ledger-panel'
import { BillingPackagesPanel } from '~/features/billing/ui/billing-packages-panel'
import { BillingReconciliationPanel } from '~/features/billing/ui/billing-reconciliation-panel'
import { BillingRechargeOrdersPanel } from '~/features/billing/ui/billing-recharge-orders-panel'
import { BillingStatsSummary } from '~/features/billing/ui/billing-stats-summary'
import { BillingTabNav } from '~/features/billing/ui/billing-tab-nav'
import { BillingUsagePanel } from '~/features/billing/ui/billing-usage-panel'
import { BillingWalletsPanel } from '~/features/billing/ui/billing-wallets-panel'
import { useAdminPermissions } from '~/shared/hooks/use-admin-permissions'
import { AdminEmptyState, AdminPageHeader, AdminPanel } from '~/shared/ui/admin-page-shell'

export function BillingAdminPage() {
  const { can } = useAdminPermissions()
  const canRead = can('admin:billing:read')
  const canReadTenants = can('admin:tenants:read')
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

  const tabVisibility = useMemo(
    () => ({ canRead, canAdjust, canWritePackages, canRefund }),
    [canRead, canAdjust, canWritePackages, canRefund],
  )

  const hasAnyBillingCapability =
    canRead || canAdjust || canWritePackages || canRefund

  const defaultTab = useMemo<BillingTab>(() => {
    if (canRead) return 'overview'
    if (canWritePackages) return 'packages'
    if (canRefund) return 'orders'
    if (canAdjust) return 'adjust'
    return 'overview'
  }, [canRead, canWritePackages, canRefund, canAdjust])

  const activeTab = useMemo(
    () =>
      resolveAccessibleBillingTab(
        parseBillingTab(searchParams.get('tab'), defaultTab),
        defaultTab,
        tabVisibility,
      ),
    [searchParams, defaultTab, tabVisibility],
  )

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

  function clearFilterSeed() {
    setSearchParams(
      (prev) => {
        const next = new URLSearchParams(prev)
        next.delete('tenantId')
        next.delete('userId')
        return next
      },
      { replace: true },
    )
  }

  const backLink =
    filterSeed.tenantId && canReadTenants
      ? { to: `/tenants/${filterSeed.tenantId}?tab=info`, label: '返回租户' }
      : { to: '/', label: '返回概览' }

  return (
    <div className="space-y-6 admin-stagger">
      <Button
        variant="ghost"
        size="sm"
        className="-ml-2 w-fit"
        nativeButton={false}
        render={<Link to={backLink.to} />}
      >
        <ArrowLeftIcon className="size-3.5" />
        {backLink.label}
      </Button>

      <AdminPageHeader
        eyebrow="Billing"
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
      {filterSeed.tenantId || filterSeed.userId ? (
        <BillingFilterSeedBanner
          tenantId={filterSeed.tenantId}
          userId={filterSeed.userId}
          onClear={clearFilterSeed}
        />
      ) : null}
      {!hasAnyBillingCapability ? (
        <AdminPanel>
          <AdminEmptyState message="当前账号无计费相关权限（admin:billing:*）。" />
        </AdminPanel>
      ) : null}
      {hasAnyBillingCapability ? (
        <div className="space-y-4">
          <BillingTabNav
            activeTab={activeTab}
            visibility={tabVisibility}
            onSelectTab={setActiveTab}
          />

          <div className="mt-4">
            {activeTab === 'overview' && canRead ? (
              <BillingStatsSummary onNavigate={navigateBilling} />
            ) : null}
            {activeTab === 'wallets' && canRead ? (
              <BillingWalletsPanel filterSeed={filterSeed} onNavigate={navigateBilling} />
            ) : null}
            {activeTab === 'ledger' && canRead ? (
              <BillingLedgerPanel filterSeed={filterSeed} />
            ) : null}
            {activeTab === 'reconciliation' && canRead ? (
              <BillingReconciliationPanel />
            ) : null}
            {activeTab === 'invoices' && canRead ? (
              <BillingInvoicesPanel filterSeed={filterSeed} />
            ) : null}
            {activeTab === 'wire-transfers' && canRead ? (
              <BillingWireTransfersPanel filterSeed={filterSeed} />
            ) : null}
            {activeTab === 'usage' && canRead ? (
              <BillingUsagePanel filterSeed={filterSeed} />
            ) : null}
            {activeTab === 'packages' && canViewPackages ? (
              <BillingPackagesPanel
                canWrite={canWritePackages}
                onCreatePackage={
                  canWritePackages ? () => setCreatePackageOpen(true) : undefined
                }
                onEditPackage={(pkg) => setEditingPackage(pkg)}
              />
            ) : null}
            {activeTab === 'coupons' && canViewPackages ? (
              <BillingCouponsPanel canWrite={canWritePackages} />
            ) : null}
            {activeTab === 'orders' && canViewOrders ? (
              <BillingRechargeOrdersPanel canRefund={canRefund} filterSeed={filterSeed} />
            ) : null}
            {activeTab === 'adjust' && canAdjust ? (
              <div className="space-y-6">
                <BillingAdjustPanel filterSeed={filterSeed} />
              </div>
            ) : null}
          </div>
        </div>
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
