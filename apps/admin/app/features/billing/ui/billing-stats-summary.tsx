import { Button } from '@repo/ui'
import { useQuery } from '@tanstack/react-query'
import {
  CircleDollarSignIcon,
  CoinsIcon,
  PackageIcon,
  ReceiptIcon,
  ScaleIcon,
  ScrollTextIcon,
  WalletIcon,
} from 'lucide-react'

import { adminBillingStatsSchema } from '~/features/billing/lib/billing-admin-api'
import type { BillingNavigateTarget } from '~/features/billing/lib/billing-admin-nav'
import { formatBillingPrice } from '~/features/billing/lib/billing-format'
import { billingAdminQueryKeys } from '~/features/billing/lib/billing-admin-query-keys'
import { billingAdminApi } from '~/shared/api/billing-admin-client'
import { formatAdminApiError } from '~/shared/lib/format-admin-api-error'
import { AdminEmptyState, AdminPanel } from '~/shared/ui/admin-page-shell'
import { AdminDetailSkeleton } from '~/shared/ui/admin-table-skeleton'

const QUICK_LINKS: {
  tab: BillingNavigateTarget['tab']
  label: string
  icon: typeof WalletIcon
}[] = [
  { tab: 'wallets', label: '用户钱包', icon: WalletIcon },
  { tab: 'orders', label: '充值订单', icon: ReceiptIcon },
  { tab: 'packages', label: '充值 SKU', icon: PackageIcon },
  { tab: 'ledger', label: '积分流水', icon: ScrollTextIcon },
  { tab: 'reconciliation', label: '日对账', icon: ScaleIcon },
  { tab: 'usage', label: '消费汇总', icon: CoinsIcon },
]

export function BillingStatsSummary({
  onNavigate,
}: {
  onNavigate?: (target: BillingNavigateTarget) => void
}) {
  const query = useQuery({
    queryKey: billingAdminQueryKeys.stats(),
    queryFn: async () =>
      adminBillingStatsSchema.parse(await billingAdminApi.get('/stats')),
  })

  const errorMessage = query.error ? formatAdminApiError(query.error) : null

  return (
    <div className="space-y-4">
      <AdminPanel>
        <div className="border-b border-border/60 px-6 py-5">
          <h3 className="text-base font-medium">平台汇总</h3>
          <p className="mt-1 text-sm text-muted-foreground">
            全平台钱包与充值 GMV 快照；数据来自 billing-api 实时统计。
          </p>
        </div>
        <div className="grid gap-4 px-6 py-5 sm:grid-cols-2 lg:grid-cols-5">
          {query.isLoading ? (
            <div className="col-span-full">
              <AdminDetailSkeleton />
            </div>
          ) : errorMessage ? (
            <div className="col-span-full">
              <AdminEmptyState
                message={errorMessage}
                onRetry={() => void query.refetch()}
                isRetrying={query.isFetching}
              />
            </div>
          ) : query.data ? (
            <>
              <StatCard
                label="钱包数"
                value={String(query.data.walletCount)}
                hint="已开通个人账户"
                icon={WalletIcon}
              />
              <StatCard
                label="积分余额合计"
                value={String(query.data.totalBalance)}
                hint="全平台可用+冻结"
                icon={CoinsIcon}
              />
              <StatCard
                label="已付订单"
                value={String(query.data.paidRechargeOrderCount)}
                hint="成功充值笔数"
                icon={ReceiptIcon}
              />
              <StatCard
                label="充值 GMV"
                value={formatBillingPrice(query.data.paidRechargeGmvCents, 'CNY')}
                hint="已支付订单金额"
                icon={CircleDollarSignIcon}
              />
              <StatCard
                label="待付订单"
                value={String(query.data.pendingRechargeOrderCount)}
                hint="待用户完成支付"
                icon={ReceiptIcon}
                emphasis={query.data.pendingRechargeOrderCount > 0}
              />
            </>
          ) : null}
        </div>
      </AdminPanel>

      {onNavigate ? (
        <AdminPanel>
          <div className="border-b border-border/60 px-6 py-4">
            <h3 className="text-sm font-medium">快捷入口</h3>
          </div>
          <div className="flex flex-wrap gap-2 px-6 py-4">
            {QUICK_LINKS.map(({ tab, label, icon: Icon }) => (
              <Button
                key={tab}
                type="button"
                variant="outline"
                size="sm"
                onClick={() => onNavigate({ tab })}
              >
                <Icon className="size-3.5" />
                {label}
              </Button>
            ))}
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={() => onNavigate({ tab: 'adjust' })}
            >
              人工调账
            </Button>
          </div>
        </AdminPanel>
      ) : null}
    </div>
  )
}

function StatCard({
  label,
  value,
  hint,
  icon: Icon,
  emphasis = false,
}: {
  label: string
  value: string
  hint: string
  icon: typeof WalletIcon
  emphasis?: boolean
}) {
  return (
    <div
      className={
        emphasis
          ? 'rounded-lg border border-amber-500/30 bg-amber-500/8 px-4 py-3'
          : 'rounded-lg border border-border/60 bg-muted/15 px-4 py-3'
      }
    >
      <div className="flex items-center gap-2 text-muted-foreground">
        <Icon className="size-3.5 shrink-0" />
        <p className="text-xs">{label}</p>
      </div>
      <p className="mt-1 text-lg font-semibold tabular-nums">{value}</p>
      <p className="mt-0.5 text-[11px] text-muted-foreground">{hint}</p>
    </div>
  )
}
