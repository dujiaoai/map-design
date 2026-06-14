import { BillingAdjustPanel } from '~/features/billing/ui/billing-adjust-panel'
import { AdminPageHeader } from '~/shared/ui/admin-page-shell'

export function BillingAdminPage() {
  return (
    <div className="space-y-6">
      <AdminPageHeader
        title="计费"
        description="平台调账 SOP：企业预付、赠送与冲正。完整订单/SKU/用量面板后续迭代。"
      />
      <BillingAdjustPanel />
    </div>
  )
}
