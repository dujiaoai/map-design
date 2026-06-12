import { useQuery } from '@tanstack/react-query'
import { useSession } from '@repo/auth'
import { Badge } from '@repo/ui'
import { ActivityIcon, Building2Icon, ShieldCheckIcon, UsersIcon } from 'lucide-react'
import { redirect } from 'react-router'

import { fetchAdminPing, fetchAdminStats } from '~/shared/api/admin-api'
import { auth } from '~/shared/auth/client'
import { canAccessAdminOverview } from '~/shared/auth/admin-access'
import { adminQueryKeys } from '~/shared/lib/admin-query-keys'

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
  const statsQuery = useQuery({
    queryKey: adminQueryKeys.stats,
    queryFn: fetchAdminStats,
  })
  const pingQuery = useQuery({
    queryKey: ['admin', 'ping'],
    queryFn: fetchAdminPing,
  })

  return (
    <div className="space-y-8">
      <header className="space-y-2">
        <p className="admin-display text-xs tracking-[0.24em] text-primary/75 uppercase">Overview</p>
        <h2 className="admin-display text-3xl font-semibold tracking-tight">运营概览</h2>
        <p className="max-w-2xl text-sm text-muted-foreground">
          平台租户与用户规模一览；数据来自 <code className="rounded bg-muted px-1.5 py-0.5 text-xs">GET /v1/admin/stats</code>。
        </p>
      </header>

      <div className="grid gap-4 sm:grid-cols-3">
        <StatCard
          icon={Building2Icon}
          label="租户总数"
          value={statsQuery.data?.tenantCount}
          loading={statsQuery.isLoading}
          error={statsQuery.isError}
        />
        <StatCard
          icon={UsersIcon}
          label="用户总数"
          value={statsQuery.data?.userCount}
          loading={statsQuery.isLoading}
          error={statsQuery.isError}
        />
        <StatCard
          icon={ActivityIcon}
          label="活跃租户"
          value={statsQuery.data?.activeTenantCount}
          loading={statsQuery.isLoading}
          error={statsQuery.isError}
        />
      </div>

      <div className="grid gap-4 md:grid-cols-2">
        <section className="rounded-xl border border-border/70 bg-card/60 p-5 shadow-sm backdrop-blur-sm">
          <div className="flex items-center gap-2 text-sm font-medium">
            <ShieldCheckIcon className="size-4 text-primary" />
            当前会话
          </div>
          <dl className="mt-4 space-y-2 text-sm">
            <div className="flex justify-between gap-4">
              <dt className="text-muted-foreground">用户</dt>
              <dd className="truncate font-medium">{session?.user.email}</dd>
            </div>
            <div className="flex justify-between gap-4">
              <dt className="text-muted-foreground">租户</dt>
              <dd>{session?.tenant?.name ?? '—'}</dd>
            </div>
            <div className="flex flex-wrap justify-end gap-1.5">
              {(session?.user.roles ?? []).map((role) => (
                <Badge key={role} variant="secondary">
                  {role}
                </Badge>
              ))}
            </div>
          </dl>
        </section>

        <section className="rounded-xl border border-border/70 bg-card/60 p-5 shadow-sm backdrop-blur-sm">
          <div className="flex items-center gap-2 text-sm font-medium">
            <ActivityIcon className="size-4 text-primary" />
            Admin API 自检
          </div>
          <div className="mt-4 space-y-2 text-sm">
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
                  <dd>{pingQuery.data.status}</dd>
                </div>
                <div className="flex justify-between gap-4">
                  <dt className="text-muted-foreground">authenticated</dt>
                  <dd>{String(pingQuery.data.authenticated)}</dd>
                </div>
                <div className="flex justify-between gap-4">
                  <dt className="text-muted-foreground">platformAdmin</dt>
                  <dd>{String(pingQuery.data.platformAdmin)}</dd>
                </div>
              </dl>
            ) : null}
          </div>
        </section>
      </div>
    </div>
  )
}

function StatCard({
  icon: Icon,
  label,
  value,
  loading,
  error,
}: {
  icon: typeof Building2Icon
  label: string
  value: number | undefined
  loading: boolean
  error: boolean
}) {
  return (
    <section className="rounded-xl border border-border/70 bg-card/60 p-5 shadow-sm backdrop-blur-sm">
      <div className="flex items-center gap-2 text-sm text-muted-foreground">
        <Icon className="size-4 text-primary" />
        {label}
      </div>
      <p className="admin-display mt-3 text-3xl font-semibold tracking-tight">
        {loading ? '—' : error ? '!' : (value ?? 0)}
      </p>
    </section>
  )
}
