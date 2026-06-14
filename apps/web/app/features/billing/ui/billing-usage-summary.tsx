import { Card, CardContent, CardDescription, CardHeader, CardTitle, Skeleton } from '@repo/ui'
import { UsersIcon } from 'lucide-react'

import { formatPoints } from '~/features/billing/lib/format-points'
import { useTeamUsageQuery } from '~/shared/queries/billing-queries'

const rangeFormatter = new Intl.DateTimeFormat('zh-CN', { dateStyle: 'medium' })

function formatUserId(userId: string): string {
  if (userId.length <= 12) return userId
  return `${userId.slice(0, 8)}…${userId.slice(-4)}`
}

export function BillingUsageSummary() {
  const usageQuery = useTeamUsageQuery()

  const rangeLabel =
    usageQuery.data?.from && usageQuery.data?.to
      ? `${rangeFormatter.format(new Date(usageQuery.data.from))} — ${rangeFormatter.format(new Date(usageQuery.data.to))}`
      : '近 30 天'

  return (
    <Card className="border-border/60 bg-card/80">
      <CardHeader>
        <CardTitle className="flex items-center gap-2 text-base">
          <UsersIcon className="size-4 text-primary" />
          团队用量汇总
        </CardTitle>
        <CardDescription>
          统计本租户成员已确认的消费点数（不含个人余额明细）· {rangeLabel}
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        {usageQuery.isPending ? (
          <div className="space-y-2">
            <Skeleton className="h-10 w-full" />
            <Skeleton className="h-10 w-full" />
          </div>
        ) : usageQuery.isError ? (
          <p className="text-muted-foreground text-sm">暂时无法加载团队用量，请稍后重试。</p>
        ) : usageQuery.data.items.length === 0 ? (
          <p className="text-muted-foreground text-sm">所选时间范围内暂无已确认的消费记录。</p>
        ) : (
          <>
            <p className="text-muted-foreground text-sm">
              合计消耗{' '}
              <span className="text-foreground font-mono font-medium tabular-nums">
                {formatPoints(usageQuery.data.totalPoints)}
              </span>{' '}
              点
            </p>
            <div className="overflow-x-auto rounded-md border border-border/60">
              <table className="w-full min-w-[420px] text-left text-sm">
                <thead className="bg-muted/40 text-muted-foreground">
                  <tr>
                    <th className="px-3 py-2 font-medium">成员</th>
                    <th className="px-3 py-2 font-medium">消费点数</th>
                    <th className="px-3 py-2 font-medium">笔数</th>
                  </tr>
                </thead>
                <tbody>
                  {usageQuery.data.items.map((item) => (
                    <tr key={item.userId} className="border-t border-border/50">
                      <td className="px-3 py-2 font-mono text-xs">{formatUserId(item.userId)}</td>
                      <td className="px-3 py-2 font-mono tabular-nums">
                        {formatPoints(item.totalPoints)}
                      </td>
                      <td className="text-muted-foreground px-3 py-2 tabular-nums">
                        {item.eventCount}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </>
        )}
      </CardContent>
    </Card>
  )
}
