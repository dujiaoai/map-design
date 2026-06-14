import { toast } from '@repo/ui'

import { formatPoints } from '~/features/billing/lib/format-points'

export function showBillingChargeSuccessToast(input: { points: number; holdId?: string }) {
  toast.success('扣费成功', {
    description: `已成功扣除 ${formatPoints(input.points)} 点积分${
      input.holdId ? ` · 预扣单 ${input.holdId.slice(0, 8)}…` : ''
    }`,
  })
}
