import { useQuery, useQueryClient } from '@tanstack/react-query'
import { useSession } from '@repo/auth'
import { Badge, Button, toast } from '@repo/ui'
import { ActivityIcon, Building2Icon, DownloadIcon, RefreshCwIcon, ShieldCheckIcon, TrendingUpIcon, UserPlusIcon, UsersIcon, PauseCircleIcon, TimerIcon } from 'lucide-react'
import { useState } from 'react'
import { Link, redirect } from 'react-router'

import { downloadAdminUsageTrendsCsv } from '~/features/dashboard/lib/usage-trends-export'

import { AdminQuickNav } from '~/widgets/admin-overview/ui/admin-quick-nav'
import { fetchAdminPing, fetchAdminStats, fetchAdminUsageTrends } from '~/shared/api/admin-api'
import { auth } from '~/shared/auth/client'
import { canAccessAdminOverview } from '~/shared/auth/admin-access'
import { useAdminPermissions } from '~/shared/hooks/use-admin-permissions'
import { adminQueryKeys } from '~/shared/lib/admin-query-keys'
import { AdminUsageTrendChart } from '~/features/dashboard/ui/admin-usage-trend-chart'
import { AdminUsageAnomalyBanner } from '~/features/dashboard/ui/admin-usage-anomaly-banner'
import { AdminMetricCard } from '~/shared/ui/admin-metric-card'
import {
  AdminConfigRow,
  AdminPageHeader,
  AdminPanel,
  AdminPanelHeader,
} from '~/shared/ui/admin-page-shell'
import { AdminStatusPill } from '~/shared/ui/admin-status-pill'

import type { Route } from './+types/dashboard'

export function meta(_args: Route.MetaArgs) {
  return [{ title: '概览 · 云眼运营后台' }]
}

export async function clientLoader(_args: Route.ClientLoaderArgs) {
  auth.hydrateSession()
  const session = auth.getSession()
  if (!canAccessAdminOverview(session)) {
    throw redirect('/members')
  }
  return null
}

export default function DashboardRoute() {
  const session = useSession()
  const { can } = useAdminPermissions()
  const queryClient = useQueryClient()
  const [refreshing, setRefreshing] = useState(false)
  const [exportingTrends, setExportingTrends] = useState(false)

  const statsQuery = useQuery({
    queryKey: adminQueryKeys.stats,
    queryFn: fetchAdminStats,
  })
  const usageTrendsQuery = useQuery({
    queryKey: adminQueryKeys.usageTrends,
    queryFn: fetchAdminUsageTrends,
  })
  const pingQuery = useQuery({
    queryKey: adminQueryKeys.ping,
    queryFn: fetchAdminPing,
  })

  const apiHealthy = pingQuery.data?.status === 'ok' && !pingQuery.isError

  async function refreshOverview() {
    setRefreshing(true)
    try {
      await Promise.all([
        queryClient.invalidateQueries({ queryKey: adminQueryKeys.stats }),
        queryClient.invalidateQueries({ queryKey: adminQueryKeys.usageTrends }),
        queryClient.invalidateQueries({ queryKey: adminQueryKeys.ping }),
      ])
      toast.success('概览数据已刷新')
    } finally {
      setRefreshing(false)
    }
  }

  return (
    <div className="admin-stagger space-y-8">
      <AdminUsageAnomalyBanner />
      <AdminPageHeader
        eyebrow="Overview"
        title="运营概览"
        description={
          <>
            平台租户与用户规模一览；数据来自{' '}
            <code className="rounded bg-muted px-1.5 py-0.5 font-mono text-xs">
              GET /v1/admin/stats
            </code>
            。
          </>
        }
        actions={
          <>
            {can('admin:tenants:read') ? (
              <Button
                nativeButton={false}
                variant="outline"
                size="sm"
                render={<Link to="/system" />}
              >
                系统状态
              </Button>
            ) : null}
            <Button
              type="button"
              variant="outline"
              size="sm"
              disabled={refreshing}
              onClick={() => void refreshOverview()}
            >
              <RefreshCwIcon className={refreshing ? 'animate-spin' : undefined} />
              刷新
            </Button>
            {pingQuery.isLoading ? null : (
              <AdminStatusPill
                level={apiHealthy ? 'ok' : 'warn'}
                label={apiHealthy ? 'Admin API 在线' : 'Admin API 异常'}
              />
            )}
          </>
        }
      />

      <div className="grid gap-4 sm:grid-cols-3">
        <AdminMetricCard
          icon={Building2Icon}
          label="租户总数"
          value={statsQuery.data?.tenantCount ?? 0}
          loading={statsQuery.isLoading}
          error={statsQuery.isError}
          onRetry={() => void statsQuery.refetch()}
          isRetrying={statsQuery.isFetching}
        />
        <AdminMetricCard
          icon={UsersIcon}
          label="用户总数"
          value={statsQuery.data?.userCount ?? 0}
          loading={statsQuery.isLoading}
          error={statsQuery.isError}
          onRetry={() => void statsQuery.refetch()}
          isRetrying={statsQuery.isFetching}
        />
        <AdminMetricCard
          icon={ActivityIcon}
          label="活跃租户"
          value={statsQuery.data?.activeTenantCount ?? 0}
          loading={statsQuery.isLoading}
          error={statsQuery.isError}
          onRetry={() => void statsQuery.refetch()}
          isRetrying={statsQuery.isFetching}
          hint="status = active"
        />
      </div>

      <div className="grid gap-4 sm:grid-cols-2">
        <AdminMetricCard
          icon={TrendingUpIcon}
          label="近 7 日活跃租户"
          value={statsQuery.data?.activeTenantsLast7Days ?? 0}
          loading={statsQuery.isLoading}
          error={statsQuery.isError}
          onRetry={() => void statsQuery.refetch()}
          isRetrying={statsQuery.isFetching}
          hint="至少一名成员登录"
        />
        <AdminMetricCard
          icon={UserPlusIcon}
          label="近 7 日新增用户"
          value={statsQuery.data?.newUsersLast7Days ?? 0}
          loading={statsQuery.isLoading}
          error={statsQuery.isError}
          onRetry={() => void statsQuery.refetch()}
          isRetrying={statsQuery.isFetching}
          hint="created_at 窗口"
        />
      </div>

      <AdminPanel>
        <AdminPanelHeader
          actions={
            <Button
              disabled={exportingTrends}
              size="sm"
              variant="outline"
              onClick={async () => {
                setExportingTrends(true)
                try {
                  await downloadAdminUsageTrendsCsv()
                  toast.success('用量趋势 CSV 已下载')
                } catch {
                  toast.error('导出失败')
                } finally {
                  setExportingTrends(false)
                }
              }}
            >
              <DownloadIcon className="mr-2 size-4" />
              导出 CSV
            </Button>
          }
          icon={TrendingUpIcon}
          title="近 7 日用量趋势"
        />
        {usageTrendsQuery.isLoading ? (
          <p className="px-4 py-4 text-sm text-muted-foreground md:px-5">加载中…</p>
        ) : usageTrendsQuery.isError ? (
          <p className="px-4 py-4 text-sm text-destructive md:px-5">无法加载用量趋势</p>
        ) : (
          <AdminUsageTrendChart days={usageTrendsQuery.data?.days ?? []} />
        )}
      </AdminPanel>

      <div className="grid gap-4 sm:grid-cols-3">
        <AdminMetricCard
          icon={PauseCircleIcon}
          label="已停用租户"
          value={statsQuery.data?.suspendedTenantCount ?? 0}
          loading={statsQuery.isLoading}
          error={statsQuery.isError}
          onRetry={() => void statsQuery.refetch()}
          isRetrying={statsQuery.isFetching}
        />
        <AdminMetricCard
          icon={TimerIcon}
          label="试用中"
          value={statsQuery.data?.trialActiveTenantCount ?? 0}
          loading={statsQuery.isLoading}
          error={statsQuery.isError}
          onRetry={() => void statsQuery.refetch()}
          isRetrying={statsQuery.isFetching}
        />
        <AdminMetricCard
          icon={Building2Icon}
          label="试用已到期"
          value={statsQuery.data?.trialExpiredTenantCount ?? 0}
          loading={statsQuery.isLoading}
          error={statsQuery.isError}
          onRetry={() => void statsQuery.refetch()}
          isRetrying={statsQuery.isFetching}
          hint="未停用但 trialEndsAt 已过"
        />
      </div>

      <div className="grid gap-4 md:grid-cols-2">
        <AdminPanel>
          <AdminPanelHeader icon={ShieldCheckIcon} title="当前会话" />
          <AdminConfigRow label="用户" value={session?.user.email ?? '—'} />
          <AdminConfigRow label="租户" value={session?.tenant?.name ?? '—'} />
          <AdminConfigRow
            label="角色"
            value={
              session?.user.roles.length ? (
                <span className="flex flex-wrap justify-end gap-1.5">
                  {session.user.roles.map((role) => (
                    <Badge key={role} variant="secondary">
                      {role}
                    </Badge>
                  ))}
                </span>
              ) : (
                '—'
              )
            }
          />
        </AdminPanel>

        <AdminPanel>
          <AdminPanelHeader icon={ActivityIcon} title="Admin API 自检" />
          {pingQuery.isLoading ? (
            <p className="px-4 py-4 text-sm text-muted-foreground md:px-5">
              正在请求 GET /v1/admin/ping …
            </p>
          ) : null}
          {pingQuery.isError ? (
            <div className="flex flex-col items-start gap-3 px-4 py-4 md:px-5">
              <p className="text-sm text-destructive">
                无法连接 admin API，请确认 saas-api 已启动。
              </p>
              <Button
                type="button"
                variant="outline"
                size="sm"
                disabled={pingQuery.isFetching}
                onClick={() => void pingQuery.refetch()}
              >
                {pingQuery.isFetching ? '重试中…' : '重试'}
              </Button>
            </div>
          ) : null}
          {pingQuery.data ? (
            <>
              <AdminConfigRow
                label="status"
                value={<span className="font-mono text-xs">{pingQuery.data.status}</span>}
              />
              <AdminConfigRow
                label="authenticated"
                value={
                  <span className="font-mono text-xs">
                    {String(pingQuery.data.authenticated)}
                  </span>
                }
              />
              <AdminConfigRow
                label="platformAdmin"
                value={
                  <span className="font-mono text-xs">
                    {String(pingQuery.data.platformAdmin)}
                  </span>
                }
              />
            </>
          ) : null}
        </AdminPanel>
      </div>

      <AdminQuickNav />
    </div>
  )
}
