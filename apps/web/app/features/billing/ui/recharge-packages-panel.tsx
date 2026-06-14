import { Button, Card, CardContent, CardDescription, CardHeader, CardTitle, Skeleton } from '@repo/ui'

import { formatPoints } from '~/features/billing/lib/format-points'
import { formatPriceCents } from '~/features/billing/lib/format-price'
import { useRechargePackagesQuery } from '~/shared/queries/billing-queries'

const PACKAGE_LABELS: Record<string, string> = {
  starter_500: '体验包',
  standard_2000: '标准包',
  pro_5000: '专业包',
}

export function RechargePackagesPanel() {
  const packagesQuery = useRechargePackagesQuery()

  return (
    <Card className="border-border/60 bg-card/80">
      <CardHeader>
        <CardTitle className="text-base">充值套餐</CardTitle>
        <CardDescription>
          积分将进入您个人账户；支付功能将在下一迭代开放（微信 / 支付宝）。
        </CardDescription>
      </CardHeader>
      <CardContent>
        {packagesQuery.isPending ? (
          <div className="grid gap-3 sm:grid-cols-3">
            <Skeleton className="h-28 w-full" />
            <Skeleton className="h-28 w-full" />
            <Skeleton className="h-28 w-full" />
          </div>
        ) : packagesQuery.isError ? (
          <p className="text-muted-foreground text-sm">暂时无法加载套餐，请稍后重试。</p>
        ) : (
          <div className="grid gap-3 sm:grid-cols-3">
            {packagesQuery.data.items.map((pkg) => (
              <div
                key={pkg.id}
                className="flex flex-col gap-3 rounded-lg border border-border/60 bg-muted/20 p-4"
              >
                <div>
                  <p className="font-medium">{PACKAGE_LABELS[pkg.code] ?? pkg.code}</p>
                  <p className="font-mono text-2xl font-semibold tabular-nums">
                    {formatPoints(pkg.points)}
                    <span className="text-muted-foreground ml-1 text-sm font-normal">点</span>
                  </p>
                  <p className="text-muted-foreground text-sm">{formatPriceCents(pkg.priceCents)}</p>
                </div>
                <Button type="button" size="sm" disabled className="mt-auto w-full">
                  支付即将上线
                </Button>
              </div>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  )
}
