import { Button } from '@repo/ui'
import { useState } from 'react'

import { BillingAdjustRecordsPanel } from '~/features/billing/ui/billing-adjust-records-panel'
import { BillingAdjustSheet } from '~/features/billing/ui/billing-adjust-sheet'
import { AdminPanel } from '~/shared/ui/admin-page-shell'

export function BillingAdjustPanel() {
  const [sheetOpen, setSheetOpen] = useState(false)

  return (
    <>
      <AdminPanel>
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
      </AdminPanel>
      <BillingAdjustRecordsPanel />
      <BillingAdjustSheet open={sheetOpen} onOpenChange={setSheetOpen} />
    </>
  )
}
