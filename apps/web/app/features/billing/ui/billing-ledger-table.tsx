import { Button, Card, CardContent, CardDescription, CardHeader, CardTitle, Skeleton } from '@repo/ui'
import { useState } from 'react'

import { formatPoints } from '~/features/billing/lib/format-points'
import {
  formatLedgerEntryType,
  formatLedgerRemark,
  formatLedgerSignedAmount,
} from '~/features/billing/lib/ledger-labels'
import { useLedgerQuery } from '~/shared/queries/billing-queries'

const dateFormatter = new Intl.DateTimeFormat('zh-CN', {
  dateStyle: 'medium',
  timeStyle: 'short',
})

export function BillingLedgerTable() {
  const [page, setPage] = useState(0)
  const pageSize = 10
  const ledgerQuery = useLedgerQuery(page, pageSize)
  const totalPages = ledgerQuery.data
    ? Math.max(1, Math.ceil(ledgerQuery.data.total / pageSize))
    : 1

  return (
    <Card className="border-border/60 bg-card/80">
      <CardHeader>
        <CardTitle className="text-base">积分流水</CardTitle>
        <CardDescription>仅展示您个人账户的入账与扣减记录</CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        {ledgerQuery.isPending ? (
          <div className="space-y-2">
            <Skeleton className="h-10 w-full" />
            <Skeleton className="h-10 w-full" />
            <Skeleton className="h-10 w-full" />
          </div>
        ) : ledgerQuery.isError ? (
          <p className="text-muted-foreground text-sm">暂时无法加载流水，请稍后重试。</p>
        ) : ledgerQuery.data.items.length === 0 ? (
          <p className="text-muted-foreground text-sm">暂无流水记录。</p>
        ) : (
          <div className="overflow-x-auto rounded-md border border-border/60">
            <table className="w-full min-w-[520px] text-left text-sm">
              <thead className="bg-muted/40 text-muted-foreground">
                <tr>
                  <th className="px-3 py-2 font-medium">时间</th>
                  <th className="px-3 py-2 font-medium">类型</th>
                  <th className="px-3 py-2 font-medium">变动</th>
                  <th className="px-3 py-2 font-medium">余额</th>
                  <th className="px-3 py-2 font-medium">说明</th>
                </tr>
              </thead>
              <tbody>
                {ledgerQuery.data.items.map((entry) => (
                  <tr key={entry.id} className="border-t border-border/50">
                    <td className="text-muted-foreground px-3 py-2 whitespace-nowrap">
                      {dateFormatter.format(new Date(entry.createdAt))}
                    </td>
                    <td className="px-3 py-2">{formatLedgerEntryType(entry.entryType)}</td>
                    <td
                      className={
                        entry.entryType === 'debit'
                          ? 'text-destructive px-3 py-2 font-mono tabular-nums'
                          : 'text-primary px-3 py-2 font-mono tabular-nums'
                      }
                    >
                      {formatLedgerSignedAmount(entry.entryType, entry.amount)}
                    </td>
                    <td className="px-3 py-2 font-mono tabular-nums">
                      {formatPoints(entry.balanceAfter)}
                    </td>
                    <td className="text-muted-foreground px-3 py-2">
                      {formatLedgerRemark(entry.remark)}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        {ledgerQuery.data && ledgerQuery.data.total > pageSize ? (
          <div className="flex items-center justify-between gap-2">
            <p className="text-muted-foreground text-xs">
              共 {ledgerQuery.data.total} 条 · 第 {page + 1} / {totalPages} 页
            </p>
            <div className="flex gap-2">
              <Button
                type="button"
                variant="outline"
                size="sm"
                disabled={page <= 0}
                onClick={() => setPage((current) => Math.max(0, current - 1))}
              >
                上一页
              </Button>
              <Button
                type="button"
                variant="outline"
                size="sm"
                disabled={page + 1 >= totalPages}
                onClick={() => setPage((current) => current + 1)}
              >
                下一页
              </Button>
            </div>
          </div>
        ) : null}
      </CardContent>
    </Card>
  )
}
