import { Button } from '@repo/ui'
import { useQuery } from '@tanstack/react-query'
import {
  AlertTriangleIcon,
  CheckCircle2Icon,
  CircleDollarSignIcon,
  CoinsIcon,
  PackageIcon,
  ReceiptIcon,
  ScaleIcon,
  ScrollTextIcon,
  WalletIcon,
} from 'lucide-react'

import {
  adminBillingStatsSchema,
  adminReconciliationStatusSchema,
  type AdminReconciliationStatus,
} from '~/features/billing/lib/billing-admin-api'
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

  const reconciliationQuery = useQuery({
    queryKey: billingAdminQueryKeys.reconciliationStatus(),
    queryFn: async () =>
      adminReconciliationStatusSchema.parse(
        await billingAdminApi.get('/reconciliation/status'),
      ),
  })

  const errorMessage = query.error ? formatAdminApiError(query.error) : null
  const reconciliationError = reconciliationQuery.error
    ? formatAdminApiError(reconciliationQuery.error)
    : null

  const showReconciliationAlert =
    reconciliationQuery.data &&
    (!reconciliationQuery.data.balanced || reconciliationQuery.data.openAlertCount > 0)

  return (
    <div className="space-y-4">
      {reconciliationQuery.isLoading ? null : reconciliationError ? (
        <AdminPanel>
          <div className="px-6 py-4">
            <AdminEmptyState
              message={reconciliationError}
              onRetry={() => void reconciliationQuery.refetch()}
              isRetrying={reconciliationQuery.isFetching}
            />
          </div>
        </AdminPanel>
      ) : showReconciliationAlert && reconciliationQuery.data ? (
        <ReconciliationAlertBanner
          status={reconciliationQuery.data}
          onNavigate={onNavigate}
        />
      ) : reconciliationQuery.data?.balanced ? (
        <ReconciliationOkBanner checkedDate={reconciliationQuery.data.checkedDate} />
      ) : null}

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

function ReconciliationOkBanner({ checkedDate }: { checkedDate: string }) {
  return (
    <AdminPanel>
      <div className="flex flex-wrap items-center gap-3 px-6 py-4">
        <CheckCircle2Icon className="size-4 shrink-0 text-emerald-600 dark:text-emerald-400" />
        <div className="min-w-0 flex-1">
          <p className="text-sm font-medium">日对账正常</p>
          <p className="mt-0.5 text-xs text-muted-foreground">
            UTC {checkedDate} 充值/退款订单与积分流水一致。
          </p>
        </div>
      </div>
    </AdminPanel>
  )
}

function ReconciliationAlertBanner({
  status,
  onNavigate,
}: {
  status: AdminReconciliationStatus
  onNavigate?: (target: BillingNavigateTarget) => void
}) {
  const alertParts: string[] = []
  if (!status.balanced) {
    alertParts.push(`UTC ${status.checkedDate} 发现 ${status.discrepancyCount} 项差异`)
  }
  if (status.openAlertCount > 0) {
    alertParts.push(`${status.openAlertCount} 条未关闭运维告警`)
  }

  return (
    <AdminPanel>
      <div className="flex flex-wrap items-start gap-3 border-b border-amber-500/25 bg-amber-500/8 px-6 py-4">
        <AlertTriangleIcon className="mt-0.5 size-4 shrink-0 text-amber-700 dark:text-amber-400" />
        <div className="min-w-0 flex-1 space-y-2">
          <div>
            <p className="text-sm font-medium text-amber-950 dark:text-amber-50">
              计费对账需关注
            </p>
            <p className="mt-0.5 text-xs text-amber-900/80 dark:text-amber-100/80">
              {alertParts.join('；')}
              {status.lastAlertAt
                ? `。最近告警：${new Date(status.lastAlertAt).toLocaleString('zh-CN', { timeZone: 'UTC' })} UTC`
                : null}
            </p>
          </div>
          {!status.balanced && status.discrepancies.length > 0 ? (
            <ul className="space-y-1 text-xs text-amber-900 dark:text-amber-100">
              {status.discrepancies.slice(0, 3).map((item) => (
                <li key={item} className="font-mono opacity-90">
                  {item}
                </li>
              ))}
              {status.discrepancies.length > 3 ? (
                <li className="text-muted-foreground">
                  另有 {status.discrepancies.length - 3} 项…
                </li>
              ) : null}
            </ul>
          ) : null}
          {onNavigate ? (
            <Button
              type="button"
              variant="outline"
              size="sm"
              className="border-amber-500/40 bg-background/60"
              onClick={() => onNavigate({ tab: 'reconciliation' })}
            >
              <ScaleIcon className="size-3.5" />
              查看日对账
            </Button>
          ) : null}
        </div>
      </div>
    </AdminPanel>
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
