import { Button, Card, CardContent, CardDescription, CardHeader, CardTitle, cn } from '@repo/ui'
import { Building2Icon, CoinsIcon, UserCircle2Icon } from 'lucide-react'

import {
  formatPoints,
  formatPriceCents,
  PRICING_PLANS,
  SIGNUP_BONUS,
} from '~/features/pricing/lib/pricing-plans'
import { webRegisterPersonalUrl } from '~/shared/config/web-app-url'

export function PricingPageContent() {
  return (
    <main className="relative overflow-hidden">
      <div className="marketing-hero-glow" aria-hidden />

      <section className="relative mx-auto max-w-6xl px-4 py-16 sm:px-6 sm:py-20">
        <div className="max-w-2xl">
          <p className="text-primary text-sm font-medium tracking-wide">预付费积分 · 按量使用</p>
          <h1 className="marketing-display mt-3 text-4xl font-semibold tracking-tight sm:text-5xl">
            简单透明的地图能力定价
          </h1>
          <p className="text-muted-foreground mt-4 text-lg leading-relaxed">
            积分进入<strong className="text-foreground font-medium">您个人账户</strong>
            ，充值与消费均按用户隔离；团队成员各自充值、各自消费，无租户共享积分池。
          </p>
        </div>

        <div className="mt-10 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {PRICING_PLANS.map((plan) => (
            <Card
              key={plan.code}
              className={cn(
                'border-border/60 bg-card/80 relative overflow-hidden',
                plan.highlight && 'border-primary/50 ring-primary/20 ring-1',
              )}
            >
              {plan.highlight ? (
                <div className="bg-primary text-primary-foreground absolute top-0 right-0 rounded-bl-md px-2 py-0.5 text-xs font-medium">
                  推荐
                </div>
              ) : null}
              <CardHeader>
                <CardTitle className="text-lg">{plan.name}</CardTitle>
                <CardDescription>{plan.description}</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <p className="marketing-display text-3xl font-semibold tabular-nums">
                    {formatPriceCents(plan.priceCents)}
                  </p>
                  <p className="text-muted-foreground mt-1 text-sm">
                    含 {formatPoints(plan.points)} 积分 · 永久有效
                  </p>
                </div>
                <Button
                  nativeButton={false}
                  className="w-full"
                  variant={plan.highlight ? 'default' : 'secondary'}
                  render={<a href={webRegisterPersonalUrl()} />}
                >
                  注册并充值
                </Button>
              </CardContent>
            </Card>
          ))}
        </div>
      </section>

      <section className="border-border/60 border-t bg-muted/20">
        <div className="mx-auto grid max-w-6xl gap-8 px-4 py-14 sm:px-6 md:grid-cols-3">
          <div className="space-y-2">
            <div className="text-primary flex items-center gap-2">
              <UserCircle2Icon className="size-4" />
              <h2 className="font-medium">个人版赠送</h2>
            </div>
            <p className="text-muted-foreground text-sm leading-relaxed">
              注册并验证邮箱后，个人空间自动赠送 {formatPoints(SIGNUP_BONUS.personal)}{' '}
              体验积分，可直接体验地图基础能力。
            </p>
          </div>
          <div className="space-y-2">
            <div className="text-primary flex items-center gap-2">
              <CoinsIcon className="size-4" />
              <h2 className="font-medium">积分账户规则</h2>
            </div>
            <p className="text-muted-foreground text-sm leading-relaxed">
              充值入账到当前登录用户的个人钱包；切换团队后余额随用户账户变化，不会合并到团队共享池。
            </p>
          </div>
          <div className="space-y-2">
            <div className="text-primary flex items-center gap-2">
              <Building2Icon className="size-4" />
              <h2 className="font-medium">企业批量采购</h2>
            </div>
            <p className="text-muted-foreground text-sm leading-relaxed">
              如需统一采购、对公转账或批量开通，请联系销售获取方案；组织首个管理员可获{' '}
              {formatPoints(SIGNUP_BONUS.organizationFirstAdmin)} 体验积分（邀请成员不重复赠送）。
            </p>
          </div>
        </div>
      </section>
    </main>
  )
}
