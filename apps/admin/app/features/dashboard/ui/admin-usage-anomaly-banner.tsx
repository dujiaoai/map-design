import { useQuery } from '@tanstack/react-query'
import { AlertTriangleIcon } from 'lucide-react'

import { fetchAdminUsageAnomalies } from '~/entities/admin-platform/api'
import { adminQueryKeys } from '~/shared/lib/admin-query-keys'
import { AdminPanel, AdminPanelHeader } from '~/shared/ui/admin-page-shell'

export function AdminUsageAnomalyBanner() {
  const query = useQuery({
    queryKey: adminQueryKeys.usageAnomalies,
    queryFn: fetchAdminUsageAnomalies,
  })

  if (query.isLoading || query.isError || !query.data?.anomalies.length) {
    return null
  }

  return (
    <AdminPanel className="border-amber-500/40 bg-amber-500/5">
      <AdminPanelHeader
        icon={AlertTriangleIcon}
        title="用量异常告警"
        description="以下指标超过近 7 日均值 2 倍（Phase 13-4）"
      />
      <ul className="space-y-2 px-4 pb-4 text-sm">
        {query.data.anomalies.map((a) => (
          <li key={`${a.metric}-${a.day}`} className="flex flex-wrap gap-2">
            <span className="font-medium text-foreground">{a.metric}</span>
            <span className="text-muted-foreground">
              当前 {a.currentValue.toFixed(0)} / 均值 {a.sevenDayAverage.toFixed(1)}（{a.ratio.toFixed(1)}x）
            </span>
          </li>
        ))}
      </ul>
    </AdminPanel>
  )
}
