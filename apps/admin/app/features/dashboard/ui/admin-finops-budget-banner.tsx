import { useQuery } from '@tanstack/react-query'
import { WalletIcon } from 'lucide-react'

import { fetchAdminFinOpsBudgetStatus } from '~/entities/admin-platform/api'
import { adminQueryKeys } from '~/shared/lib/admin-query-keys'
import { AdminPanel, AdminPanelHeader } from '~/shared/ui/admin-page-shell'

export function AdminFinOpsBudgetBanner() {
  const query = useQuery({
    queryKey: adminQueryKeys.finOpsBudget,
    queryFn: fetchAdminFinOpsBudgetStatus,
  })

  if (query.isLoading || query.isError || !query.data?.alert) {
    return null
  }

  const status = query.data
  return (
    <AdminPanel className="border-amber-500/40 bg-amber-500/5">
      <AdminPanelHeader
        icon={WalletIcon}
        title="FinOps 预算告警"
        description={`估算 $${status.estimatedMonthlyCostUsd.toFixed(2)} / 预算 $${status.monthlyBudgetUsd.toFixed(2)}（${status.utilizationPercent.toFixed(1)}%）`}
      />
      {status.throttleActive ? (
        <p className="px-4 pb-4 text-sm text-muted-foreground">超预算租户 API 节流骨架已激活</p>
      ) : null}
    </AdminPanel>
  )
}
