import { useQuery } from '@tanstack/react-query'

import { fetchAdminRoles } from '~/shared/api/admin-api'
import { requireAdminPermissions } from '~/shared/auth/require-admin-permissions'

import type { Route } from './+types/roles'

export function meta(_args: Route.MetaArgs) {
  return [{ title: '角色 · 云眼运营后台' }]
}

export async function clientLoader(_args: Route.ClientLoaderArgs) {
  requireAdminPermissions(['admin:roles:read'])
  return null
}

export default function RolesRoute() {
  const query = useQuery({ queryKey: ['admin', 'roles'], queryFn: fetchAdminRoles })

  return (
    <div className="space-y-6">
      <header>
        <h2 className="admin-display text-2xl font-semibold">角色</h2>
        <p className="mt-1 text-sm text-muted-foreground">GET /v1/admin/roles 联调预览</p>
      </header>

      {query.isLoading ? <p className="text-sm text-muted-foreground">加载中…</p> : null}
      {query.isError ? <p className="text-sm text-destructive">加载失败</p> : null}
      {query.data ? (
        <ul className="divide-y divide-border rounded-xl border border-border/70 bg-card/50">
          {query.data.roles.map((role) => (
            <li key={role.id} className="px-4 py-3 text-sm font-medium">
              {role.code}
            </li>
          ))}
        </ul>
      ) : null}
    </div>
  )
}
