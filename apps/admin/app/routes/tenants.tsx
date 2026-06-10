import { useQuery } from '@tanstack/react-query'

import { fetchAdminTenants } from '~/shared/api/admin-api'
import { requireAdminPermissions } from '~/shared/auth/require-admin-permissions'

import type { Route } from './+types/tenants'

export function meta(_args: Route.MetaArgs) {
  return [{ title: '租户 · 云眼运营后台' }]
}

export async function clientLoader(_args: Route.ClientLoaderArgs) {
  requireAdminPermissions(['admin:tenants:read'])
  return null
}

export default function TenantsRoute() {
  const query = useQuery({ queryKey: ['admin', 'tenants'], queryFn: fetchAdminTenants })

  return (
    <div className="space-y-6">
      <header>
        <h2 className="admin-display text-2xl font-semibold">租户</h2>
        <p className="mt-1 text-sm text-muted-foreground">
          D-08 将在此提供完整表格与表单；当前为 API 联调预览。
        </p>
      </header>

      {query.isLoading ? <p className="text-sm text-muted-foreground">加载中…</p> : null}
      {query.isError ? <p className="text-sm text-destructive">加载失败</p> : null}
      {query.data ? (
        <ul className="divide-y divide-border rounded-xl border border-border/70 bg-card/50">
          {query.data.tenants.map((tenant) => (
            <li key={tenant.id} className="flex items-center justify-between gap-4 px-4 py-3 text-sm">
              <div>
                <p className="font-medium">{tenant.name}</p>
                <p className="text-muted-foreground">{tenant.slug}</p>
              </div>
              <span className="text-xs text-muted-foreground">{tenant.status}</span>
            </li>
          ))}
        </ul>
      ) : null}
    </div>
  )
}
