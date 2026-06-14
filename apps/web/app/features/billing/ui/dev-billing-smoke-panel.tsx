import { ApiError } from '@repo/api-client'
import { Button, Card, CardContent, CardDescription, CardHeader, CardTitle } from '@repo/ui'
import { useQueryClient } from '@tanstack/react-query'
import { FlaskConicalIcon } from 'lucide-react'
import { useCallback, useState } from 'react'

import { showBillingChargeSuccessToast } from '~/features/billing/lib/show-billing-charge-success-toast'
import { BillingCostPreview } from '~/features/billing/ui/billing-cost-preview'
import { api } from '~/shared/api/client'
import { billingQueryKeys } from '~/shared/queries/billing-queries'

type SmokeConsumeResponse = {
  holdId: string
  points: number
  status: string
}

export function DevBillingSmokePanel() {
  const queryClient = useQueryClient()
  const [busy, setBusy] = useState(false)
  const [errorMessage, setErrorMessage] = useState<string | null>(null)

  const runSmokeConsume = useCallback(async () => {
    setBusy(true)
    setErrorMessage(null)
    try {
      const result = await api.post<SmokeConsumeResponse>('/dev/billing/smoke-consume')
      await queryClient.invalidateQueries({ queryKey: billingQueryKeys.all })
      showBillingChargeSuccessToast({ points: result.points, holdId: result.holdId })
    } catch (error) {
      if (error instanceof ApiError && error.status === 402) {
        setErrorMessage('余额不足（402 弹窗应已自动弹出）')
        return
      }
      setErrorMessage(error instanceof Error ? error.message : '请求失败')
    } finally {
      setBusy(false)
    }
  }, [queryClient])

  if (!import.meta.env.DEV) return null

  return (
    <Card className="border-dashed border-primary/40 bg-card/60">
      <CardHeader>
        <CardTitle className="flex items-center gap-2 text-base">
          <FlaskConicalIcon className="size-4 text-primary" />
          开发冒烟：模拟扣费
        </CardTitle>
        <CardDescription>
          调用 saas-api dev 接口 hold + confirm 各 1 点；需后端 dev profile 且 billing 已启用。
        </CardDescription>
      </CardHeader>
      <CardContent className="flex flex-col gap-3 sm:flex-row sm:items-center">
        <div className="flex flex-1 flex-col gap-2">
          <BillingCostPreview ruleCode="billing.smoke.consume" />
          <Button type="button" variant="secondary" disabled={busy} onClick={runSmokeConsume}>
            {busy ? '扣费中…' : '执行 smoke-consume（1 点）'}
          </Button>
        </div>
        {errorMessage ? <p className="text-destructive text-sm">{errorMessage}</p> : null}
      </CardContent>
    </Card>
  )
}
