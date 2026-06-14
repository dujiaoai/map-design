import { Button } from '@repo/ui'
import { ArrowRightIcon, MapIcon, SparklesIcon } from 'lucide-react'
import { Link } from 'react-router'

import { SIGNUP_BONUS, formatPoints } from '~/features/pricing/lib/pricing-plans'
import { webRegisterPersonalUrl } from '~/shared/config/web-app-url'

export default function HomeRoute() {
  return (
    <main className="relative overflow-hidden">
      <div className="marketing-hero-glow" aria-hidden />

      <section className="relative mx-auto flex max-w-6xl flex-col gap-10 px-4 py-20 sm:px-6 sm:py-28">
        <div className="max-w-3xl">
          <p className="text-primary inline-flex items-center gap-1.5 text-sm font-medium">
            <SparklesIcon className="size-4" />
            个人版现已开放
          </p>
          <h1 className="marketing-display mt-4 text-4xl font-semibold tracking-tight sm:text-6xl">
            专业地图工作台，
            <br />
            按积分灵活使用
          </h1>
          <p className="text-muted-foreground mt-6 max-w-2xl text-lg leading-relaxed">
            云眼地图为测绘、巡检与空间分析提供 SaaS 工作台。注册即送{' '}
            {formatPoints(SIGNUP_BONUS.personal)} 体验积分，按需充值，积分归属您的个人账户。
          </p>
          <div className="mt-8 flex flex-wrap gap-3">
            <Button nativeButton={false} size="lg" render={<a href={webRegisterPersonalUrl()} />}>
              免费开始
              <ArrowRightIcon className="size-4" />
            </Button>
            <Button nativeButton={false} size="lg" variant="secondary" render={<Link to="/pricing" />}>
              查看定价
            </Button>
          </div>
        </div>

        <div className="border-border/60 bg-card/50 grid gap-4 rounded-xl border p-6 sm:grid-cols-3">
          <div>
            <MapIcon className="text-primary mb-2 size-5" />
            <h2 className="font-medium">地图工作台</h2>
            <p className="text-muted-foreground mt-1 text-sm">标绘、量测、专题图层等基础 GIS 能力</p>
          </div>
          <div>
            <SparklesIcon className="text-primary mb-2 size-5" />
            <h2 className="font-medium">预付费积分</h2>
            <p className="text-muted-foreground mt-1 text-sm">用多少充多少，余额不足时引导充值</p>
          </div>
          <div>
            <ArrowRightIcon className="text-primary mb-2 size-5" />
            <h2 className="font-medium">个人与团队</h2>
            <p className="text-muted-foreground mt-1 text-sm">个人版免 slug 注册；团队场景成员各自账户</p>
          </div>
        </div>
      </section>
    </main>
  )
}
