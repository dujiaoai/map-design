import { useQuery } from '@tanstack/react-query'

import { fetchAdminUsers } from '~/shared/api/admin-api'
import { requireAdminPermissions } from '~/shared/auth/require-admin-permissions'

import type { Route } from './+types/users'

export function meta(_args: Route.MetaArgs) {
  return [{ title: '用户 · 云眼运营后台' }]
}

export async function clientLoader(_args: Route.ClientLoaderArgs) {
  requireAdminPermissions(['admin:users:read'])
  return null
}

export default function UsersRoute() {
  const query = useQuery({ queryKey: ['admin', 'users'], queryFn: fetchAdminUsers })

  return (
    <div className="space-y-6">
      <header>
        <h2 className="admin-display text-2xl font-semibold">用户</h2>
        <p className="mt-1 text-sm text-muted-foreground">GET /v1/admin/users 联调预览</p>
      </header>

      {query.isLoading ? <p className="text-sm text-muted-foreground">加载中…</p> : null}
      {query.isError ? <p className="text-sm text-destructive">加载失败</p> : null}
      {query.data ? (
        <ul className="divide-y divide-border rounded-xl border border-border/70 bg-card/50">
          {query.data.users.map((user) => (
            <li key={user.id} className="flex items-center justify-between gap-4 px-4 py-3 text-sm">
              <div>
                <p className="font-medium">{user.email}</p>
                <p className="text-muted-foreground">{user.tenantSlug}</p>
              </div>
              <span className="text-xs text-muted-foreground">{user.status}</span>
            </li>
          ))}
        </ul>
      ) : null}
    </div>
  )
}
