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
    <AdminPanel className="overflow-hidden border-amber-500/35">
      <div className="border-b border-amber-500/20 bg-amber-500/8">
        <AdminPanelHeader
          icon={AlertTriangleIcon}
          title="用量异常告警"
          description="以下指标超过近 7 日均值 2 倍，建议排查突发流量或配置变更。"
        />
      </div>
      <ul className="divide-y divide-amber-500/15">
        {query.data.anomalies.map((a) => (
          <li
            key={`${a.metric}-${a.day}`}
            className="flex flex-wrap items-center justify-between gap-3 px-4 py-3 text-sm md:px-5"
          >
            <div className="flex flex-wrap items-center gap-2">
              <span className="rounded-md border border-amber-500/30 bg-amber-500/10 px-2 py-0.5 font-mono text-xs text-amber-100">
                {a.metric}
              </span>
              <span className="text-xs text-muted-foreground">{a.day}</span>
            </div>
            <span className="font-mono text-xs text-amber-50/90">
              当前 {a.currentValue.toFixed(0)} / 均值 {a.sevenDayAverage.toFixed(1)}
              <span className="ml-2 rounded-full bg-amber-500/20 px-2 py-0.5 text-amber-100">
                {a.ratio.toFixed(1)}×
              </span>
            </span>
          </li>
        ))}
      </ul>
    </AdminPanel>
  )
}
