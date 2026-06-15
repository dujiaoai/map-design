import { Button, Input } from '@repo/ui'
import { useQuery } from '@tanstack/react-query'
import { AlertTriangleIcon, CheckCircle2Icon, ScaleIcon } from 'lucide-react'
import { useId, useState } from 'react'

import {
  adminBillingReconciliationQuery,
  adminReconciliationDailySchema,
  defaultReconciliationDateUtc,
} from '~/features/billing/lib/billing-admin-api'
import { formatBillingPrice } from '~/features/billing/lib/billing-format'
import { billingAdminQueryKeys } from '~/features/billing/lib/billing-admin-query-keys'
import { billingAdminApi } from '~/shared/api/billing-admin-client'
import { formatAdminApiError } from '~/shared/lib/format-admin-api-error'
import { AdminField, AdminFormError } from '~/shared/ui/admin-field'
import { AdminEmptyState, AdminPanel } from '~/shared/ui/admin-page-shell'
import { AdminDetailSkeleton } from '~/shared/ui/admin-table-skeleton'

function formatDiscrepancy(message: string) {
  if (message.startsWith('paid_order_count_mismatch')) {
    return '充值笔数：订单与积分流水不一致'
  }
  if (message.startsWith('recharge_points_mismatch')) {
    return '充值积分：订单合计与流水合计不一致'
  }
  if (message.startsWith('refunded_order_count_mismatch')) {
    return '退款笔数：订单与积分流水不一致'
  }
  if (message.startsWith('refund_points_mismatch')) {
    return '退款积分：订单合计与流水合计不一致'
  }
  return message
}

export function BillingReconciliationPanel() {
  const dateInputId = useId()
  const [dateInput, setDateInput] = useState(defaultReconciliationDateUtc())
  const [activeDate, setActiveDate] = useState(defaultReconciliationDateUtc())
  const [dateError, setDateError] = useState<string | null>(null)

  const query = useQuery({
    queryKey: billingAdminQueryKeys.reconciliation(activeDate),
    queryFn: async () =>
      adminReconciliationDailySchema.parse(
        await billingAdminApi.get(
          `/reconciliation/daily${adminBillingReconciliationQuery({ date: activeDate })}`,
        ),
      ),
  })

  const errorMessage = query.error ? formatAdminApiError(query.error) : null

  function runQuery() {
    const trimmed = dateInput.trim()
    if (!/^\d{4}-\d{2}-\d{2}$/.test(trimmed)) {
      setDateError('请输入 YYYY-MM-DD 格式的 UTC 日期')
      return
    }
    setDateError(null)
    setActiveDate(trimmed)
  }

  return (
    <div className="space-y-4">
      <AdminPanel>
        <div className="border-b border-border/60 px-6 py-5">
          <div className="flex items-start gap-3">
            <ScaleIcon className="mt-0.5 size-4 text-muted-foreground" />
            <div>
              <h3 className="text-base font-medium">日对账</h3>
              <p className="mt-1 text-sm text-muted-foreground">
                按 UTC 自然日对比充值/退款订单与积分流水；默认查询昨日。
              </p>
            </div>
          </div>
        </div>
        <div className="flex flex-wrap items-end gap-3 px-6 py-5">
          <AdminField label="对账日期 (UTC)" htmlFor={dateInputId}>
            <Input
              id={dateInputId}
              type="date"
              value={dateInput}
              onChange={(event) => setDateInput(event.target.value)}
            />
          </AdminField>
          <Button type="button" size="sm" onClick={runQuery}>
            查询
          </Button>
        </div>
        {dateError ? (
          <div className="px-6 pb-5">
            <AdminFormError message={dateError} />
          </div>
        ) : null}
      </AdminPanel>

      {query.isLoading ? (
        <AdminPanel>
          <div className="px-6 py-5">
            <AdminDetailSkeleton />
          </div>
        </AdminPanel>
      ) : errorMessage ? (
        <AdminPanel>
          <div className="px-6 py-5">
            <AdminEmptyState message={errorMessage} />
          </div>
        </AdminPanel>
      ) : query.data ? (
        <>
          <AdminPanel>
            <div className="flex flex-wrap items-center justify-between gap-3 border-b border-border/60 px-6 py-4">
              <p className="text-sm text-muted-foreground">
                对账区间：{query.data.from} → {query.data.to}
              </p>
              <div
                className={
                  query.data.balanced
                    ? 'inline-flex items-center gap-1.5 rounded-full border border-emerald-500/40 bg-emerald-500/10 px-3 py-1 text-xs font-medium text-emerald-600 dark:text-emerald-400'
                    : 'inline-flex items-center gap-1.5 rounded-full border border-amber-500/40 bg-amber-500/10 px-3 py-1 text-xs font-medium text-amber-700 dark:text-amber-400'
                }
              >
                {query.data.balanced ? (
                  <CheckCircle2Icon className="size-3.5" />
                ) : (
                  <AlertTriangleIcon className="size-3.5" />
                )}
                {query.data.balanced ? '账目一致' : '存在差异'}
              </div>
            </div>

            <div className="grid gap-6 px-6 py-5 lg:grid-cols-2">
              <ReconciliationSection
                title="充值"
                orderCount={query.data.paidOrderCount}
                orderPoints={query.data.paidOrderPoints}
                orderGmvCents={query.data.paidOrderGmvCents}
                ledgerCount={query.data.rechargeLedgerCount}
                ledgerPoints={query.data.rechargeLedgerPoints}
              />
              <ReconciliationSection
                title="退款"
                orderCount={query.data.refundedOrderCount}
                orderPoints={query.data.refundedOrderPoints}
                orderGmvCents={query.data.refundedOrderGmvCents}
                ledgerCount={query.data.refundLedgerCount}
                ledgerPoints={query.data.refundLedgerPoints}
              />
            </div>
          </AdminPanel>

          {!query.data.balanced && query.data.discrepancies.length > 0 ? (
            <AdminPanel>
              <div className="border-b border-border/60 px-6 py-4">
                <h3 className="text-sm font-medium">差异明细</h3>
              </div>
              <ul className="space-y-2 px-6 py-4 text-sm">
                {query.data.discrepancies.map((item) => (
                  <li
                    key={item}
                    className="rounded-md border border-amber-500/25 bg-amber-500/8 px-3 py-2 text-amber-900 dark:text-amber-100"
                  >
                    {formatDiscrepancy(item)}
                    <span className="mt-1 block font-mono text-[11px] text-muted-foreground">
                      {item}
                    </span>
                  </li>
                ))}
              </ul>
            </AdminPanel>
          ) : null}
        </>
      ) : null}
    </div>
  )
}

function ReconciliationSection({
  title,
  orderCount,
  orderPoints,
  orderGmvCents,
  ledgerCount,
  ledgerPoints,
}: {
  title: string
  orderCount: number
  orderPoints: number
  orderGmvCents: number
  ledgerCount: number
  ledgerPoints: number
}) {
  const countMatch = orderCount === ledgerCount
  const pointsMatch = orderPoints === ledgerPoints

  return (
    <div className="rounded-lg border border-border/60 bg-muted/10 p-4">
      <h4 className="text-sm font-medium">{title}</h4>
      <dl className="mt-3 space-y-2 text-sm">
        <Row
          label="订单笔数"
          value={String(orderCount)}
          match={countMatch}
          peerLabel="流水笔数"
          peerValue={String(ledgerCount)}
        />
        <Row
          label="订单积分"
          value={String(orderPoints)}
          match={pointsMatch}
          peerLabel="流水积分"
          peerValue={String(ledgerPoints)}
        />
        {orderGmvCents > 0 ? (
          <div className="flex justify-between gap-4 border-t border-border/40 pt-2 text-muted-foreground">
            <dt>订单 GMV</dt>
            <dd className="tabular-nums text-foreground">
              {formatBillingPrice(orderGmvCents, 'CNY')}
            </dd>
          </div>
        ) : null}
      </dl>
    </div>
  )
}

function Row({
  label,
  value,
  match,
  peerLabel,
  peerValue,
}: {
  label: string
  value: string
  match: boolean
  peerLabel: string
  peerValue: string
}) {
  return (
    <div className="grid grid-cols-2 gap-3">
      <div>
        <dt className="text-xs text-muted-foreground">{label}</dt>
        <dd className="tabular-nums font-medium">{value}</dd>
      </div>
      <div>
        <dt className="text-xs text-muted-foreground">{peerLabel}</dt>
        <dd
          className={
            match
              ? 'tabular-nums font-medium'
              : 'tabular-nums font-medium text-amber-700 dark:text-amber-400'
          }
        >
          {peerValue}
        </dd>
      </div>
    </div>
  )
}
