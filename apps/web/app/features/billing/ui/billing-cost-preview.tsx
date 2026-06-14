import { cn, Skeleton } from '@repo/ui'

import { formatPoints } from '~/features/billing/lib/format-points'
import { useBillingEstimateQuery } from '~/shared/queries/billing-queries'

export function BillingCostPreview({
  productCode = 'map-workspace',
  ruleCode,
  quantity = 1,
  className,
}: {
  productCode?: string
  ruleCode: string
  quantity?: number
  className?: string
}) {
  const estimateQuery = useBillingEstimateQuery(productCode, ruleCode, quantity)

  if (estimateQuery.isPending) {
    return <Skeleton className={cn('h-4 w-40', className)} />
  }

  if (estimateQuery.isError || !estimateQuery.data) {
    return null
  }

  return (
    <p className={cn('text-muted-foreground text-sm', className)}>
      预计消耗{' '}
      <span className="text-foreground font-mono font-medium tabular-nums">
        {formatPoints(estimateQuery.data.points)}
      </span>{' '}
      点
      {estimateQuery.data.unitLabel ? (
        <span className="text-muted-foreground">（{estimateQuery.data.unitLabel}）</span>
      ) : null}
    </p>
  )
}
