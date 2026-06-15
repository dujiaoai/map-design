import { useQuery, useQueryClient } from '@tanstack/react-query'
import { useSession } from '@repo/auth'
import { Badge, Button } from '@repo/ui'
import { ActivityIcon, Building2Icon, RefreshCwIcon, ShieldCheckIcon, UsersIcon } from 'lucide-react'
import { useState } from 'react'
import { Link, redirect } from 'react-router'

import { AdminQuickNav } from '~/widgets/admin-overview/ui/admin-quick-nav'
import { fetchAdminPing, fetchAdminStats } from '~/shared/api/admin-api'
import { auth } from '~/shared/auth/client'
import { canAccessAdminOverview } from '~/shared/auth/admin-access'
import { useAdminPermissions } from '~/shared/hooks/use-admin-permissions'
import { adminQueryKeys } from '~/shared/lib/admin-query-keys'
import { AdminMetricCard } from '~/shared/ui/admin-metric-card'
import { AdminPageHeader, AdminPanel, AdminPanelHeader } from '~/shared/ui/admin-page-shell'
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

  const statsQuery = useQuery({
    queryKey: adminQueryKeys.stats,
    queryFn: fetchAdminStats,
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
        queryClient.invalidateQueries({ queryKey: adminQueryKeys.ping }),
      ])
    } finally {
      setRefreshing(false)
    }
  }

  return (
    <div className="admin-stagger space-y-8">
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
        />
        <AdminMetricCard
          icon={UsersIcon}
          label="用户总数"
          value={statsQuery.data?.userCount ?? 0}
          loading={statsQuery.isLoading}
          error={statsQuery.isError}
        />
        <AdminMetricCard
          icon={ActivityIcon}
          label="活跃租户"
          value={statsQuery.data?.activeTenantCount ?? 0}
          loading={statsQuery.isLoading}
          error={statsQuery.isError}
          hint="status = active"
        />
      </div>

      <div className="grid gap-4 md:grid-cols-2">
        <AdminPanel>
          <AdminPanelHeader icon={ShieldCheckIcon} title="当前会话" />
          <dl className="space-y-2 px-4 py-4 text-sm md:px-5">
            <div className="flex justify-between gap-4">
              <dt className="text-muted-foreground">用户</dt>
              <dd className="truncate font-medium">{session?.user.email}</dd>
            </div>
            <div className="flex justify-between gap-4">
              <dt className="text-muted-foreground">租户</dt>
              <dd>{session?.tenant?.name ?? '—'}</dd>
            </div>
            <div className="flex flex-wrap justify-end gap-1.5 pt-1">
              {(session?.user.roles ?? []).map((role) => (
                <Badge key={role} variant="secondary">
                  {role}
                </Badge>
              ))}
            </div>
          </dl>
        </AdminPanel>

        <AdminPanel>
          <AdminPanelHeader icon={ActivityIcon} title="Admin API 自检" />
          <div className="space-y-2 px-4 py-4 text-sm md:px-5">
            {pingQuery.isLoading ? (
              <p className="text-muted-foreground">正在请求 GET /v1/admin/ping …</p>
            ) : null}
            {pingQuery.isError ? (
              <p className="text-destructive">无法连接 admin API，请确认 saas-api 已启动。</p>
            ) : null}
            {pingQuery.data ? (
              <dl className="space-y-2">
                <div className="flex justify-between gap-4">
                  <dt className="text-muted-foreground">status</dt>
                  <dd className="font-mono text-xs">{pingQuery.data.status}</dd>
                </div>
                <div className="flex justify-between gap-4">
                  <dt className="text-muted-foreground">authenticated</dt>
                  <dd className="font-mono text-xs">{String(pingQuery.data.authenticated)}</dd>
                </div>
                <div className="flex justify-between gap-4">
                  <dt className="text-muted-foreground">platformAdmin</dt>
                  <dd className="font-mono text-xs">{String(pingQuery.data.platformAdmin)}</dd>
                </div>
              </dl>
            ) : null}
          </div>
        </AdminPanel>
      </div>

      <AdminQuickNav />
    </div>
  )
}
