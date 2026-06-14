import { Button } from '@repo/ui'
import { useState } from 'react'

import {
  BillingAdjustSheet,
  type BillingAdjustResult,
} from '~/features/billing/ui/billing-adjust-sheet'
import { AdminPanel } from '~/shared/ui/admin-page-shell'

export function BillingAdjustPanel() {
  const [sheetOpen, setSheetOpen] = useState(false)
  const [lastResult, setLastResult] = useState<BillingAdjustResult | null>(null)

  return (
    <>
      <AdminPanel className="max-w-2xl">
        <div className="flex flex-wrap items-start justify-between gap-4 border-b border-border/60 px-6 py-5">
          <div>
            <h3 className="text-base font-medium">平台人工调账</h3>
            <p className="mt-1 text-sm text-muted-foreground">
              用于企业预付、赠送或冲正；积分进入目标用户个人账户。正数为入账，负数为扣减。
            </p>
          </div>
          <Button type="button" size="sm" onClick={() => setSheetOpen(true)}>
            调账
          </Button>
        </div>
        {lastResult ? (
          <div className="space-y-2 px-6 py-5 text-sm">
            <p className="font-medium text-foreground">
              {lastResult.idempotentReplay ? '幂等重放' : '调账成功'}
            </p>
            <p className="text-muted-foreground">
              变动 {lastResult.amount} 点，余额 {lastResult.balanceAfter} 点
            </p>
            <p className="text-muted-foreground">备注：{lastResult.remark}</p>
          </div>
        ) : (
          <div className="px-6 py-5 text-sm text-muted-foreground">暂无调账记录。</div>
        )}
      </AdminPanel>
      <BillingAdjustSheet
        open={sheetOpen}
        onOpenChange={setSheetOpen}
        onSuccess={setLastResult}
      />
    </>
  )
}
