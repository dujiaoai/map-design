import { useQuery } from '@tanstack/react-query'

import { adminBillingStatsSchema } from '~/features/billing/lib/billing-admin-api'
import { billingAdminApi } from '~/shared/api/billing-admin-client'
import { formatAdminApiError } from '~/shared/lib/format-admin-api-error'
import { AdminEmptyState, AdminPanel } from '~/shared/ui/admin-page-shell'

function formatGmv(cents: number) {
  return `¥${(cents / 100).toLocaleString('zh-CN', { minimumFractionDigits: 2 })}`
}

export function BillingStatsSummary() {
  const query = useQuery({
    queryKey: ['admin', 'billing', 'stats'],
    queryFn: async () =>
      adminBillingStatsSchema.parse(await billingAdminApi.get('/stats')),
  })

  const errorMessage = query.error ? formatAdminApiError(query.error) : null

  return (
    <AdminPanel>
      <div className="border-b border-border/60 px-6 py-5">
        <h3 className="text-base font-medium">平台汇总</h3>
        <p className="mt-1 text-sm text-muted-foreground">全平台钱包与充值 GMV 快照。</p>
      </div>
      <div className="grid gap-4 px-6 py-5 sm:grid-cols-2 lg:grid-cols-5">
        {query.isLoading ? (
          <AdminEmptyState message="加载汇总…" />
        ) : errorMessage ? (
          <AdminEmptyState message={errorMessage} />
        ) : query.data ? (
          <>
            <StatCard label="钱包数" value={String(query.data.walletCount)} />
            <StatCard label="积分余额合计" value={String(query.data.totalBalance)} />
            <StatCard label="已付订单" value={String(query.data.paidRechargeOrderCount)} />
            <StatCard label="充值 GMV" value={formatGmv(query.data.paidRechargeGmvCents)} />
            <StatCard label="待付订单" value={String(query.data.pendingRechargeOrderCount)} />
          </>
        ) : null}
      </div>
    </AdminPanel>
  )
}

function StatCard({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-lg border border-border/60 bg-muted/15 px-4 py-3">
      <p className="text-xs text-muted-foreground">{label}</p>
      <p className="mt-1 text-lg font-semibold tabular-nums">{value}</p>
    </div>
  )
}
