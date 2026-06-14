import type { Route } from './+types/pricing'

import { PricingPageContent } from '~/features/pricing/ui/pricing-page'

export function meta(_args: Route.MetaArgs) {
  return [
    { title: '定价 · 云眼地图' },
    {
      name: 'description',
      content: '云眼地图预付费积分定价：积分按用户个人账户计费，支持个人版与团队场景。',
    },
  ]
}

export default function PricingRoute() {
  return <PricingPageContent />
}
