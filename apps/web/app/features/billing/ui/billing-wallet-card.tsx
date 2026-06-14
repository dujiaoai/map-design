import { Button, Card, CardContent, CardDescription, CardHeader, CardTitle, cn, Skeleton } from '@repo/ui'
import { CoinsIcon, WalletIcon } from 'lucide-react'
import { Link } from 'react-router'

import { formatPoints } from '~/features/billing/lib/format-points'
import { useWalletQuery } from '~/shared/queries/billing-queries'

export function BillingWalletCard({
  variant = 'compact',
  className,
}: {
  variant?: 'compact' | 'page'
  className?: string
}) {
  const walletQuery = useWalletQuery()
  const isPage = variant === 'page'

  if (walletQuery.isPending) {
    return (
      <Card className={cn('border-border/60 bg-card/80', className)}>
        <CardHeader className={cn(isPage ? 'pb-2' : 'py-3')}>
          <Skeleton className={cn('h-4', isPage ? 'w-24' : 'w-16')} />
          {isPage ? <Skeleton className="mt-2 h-3 w-40" /> : null}
        </CardHeader>
        {isPage ? (
          <CardContent>
            <Skeleton className="h-10 w-32" />
          </CardContent>
        ) : (
          <Skeleton className="mx-4 mb-3 h-4 w-20" />
        )}
      </Card>
    )
  }

  if (walletQuery.isError) {
    return (
      <Card className={cn('border-border/60 bg-card/80', className)}>
        <CardHeader className={cn(isPage ? 'pb-2' : 'py-3')}>
          <CardTitle className={cn('flex items-center gap-2', isPage ? 'text-lg' : 'text-sm')}>
            <WalletIcon className="size-4 text-primary" />
            我的积分
          </CardTitle>
          {isPage ? (
            <CardDescription>暂时无法加载钱包，请稍后重试或联系管理员。</CardDescription>
          ) : null}
        </CardHeader>
      </Card>
    )
  }

  const wallet = walletQuery.data
  const available = wallet?.availableBalance ?? 0
  const frozen = wallet?.frozenBalance ?? 0

  if (!isPage) {
    return (
      <Button
        nativeButton={false}
        variant="ghost"
        size="sm"
        className={cn(
          'h-8 gap-1.5 px-2 font-mono text-xs tabular-nums',
          className,
        )}
        render={<Link to="/billing" aria-label="查看积分钱包" />}
      >
        <CoinsIcon className="size-3.5 text-primary" />
        <span>{formatPoints(available)}</span>
        <span className="text-muted-foreground hidden sm:inline">点</span>
      </Button>
    )
  }

  return (
    <Card className={cn('border-border/60 bg-card/80 shadow-sm', className)}>
      <CardHeader>
        <CardTitle className="flex items-center gap-2 text-lg">
          <WalletIcon className="size-5 text-primary" />
          我的积分钱包
        </CardTitle>
        <CardDescription>
          充值与消费均计入您在本租户下的个人账户；切换团队后余额会随之更新。
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div>
          <p className="text-muted-foreground text-sm">可用余额</p>
          <p className="font-mono text-4xl font-semibold tracking-tight tabular-nums">
            {formatPoints(available)}
            <span className="text-muted-foreground ml-2 text-base font-normal">点</span>
          </p>
        </div>
        {frozen > 0 ? (
          <p className="text-muted-foreground text-sm">
            冻结中 {formatPoints(frozen)} 点（待业务确认后将扣减或释放）
          </p>
        ) : null}
        <p className="text-muted-foreground text-xs">
          总余额 {formatPoints(wallet?.balance ?? 0)} 点
        </p>
      </CardContent>
    </Card>
  )
}
