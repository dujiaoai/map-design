import { Button } from '@repo/ui'
import { Link } from 'react-router'

import type { Route } from './+types/forbidden'

export function meta(_args: Route.MetaArgs) {
  return [{ title: '无权访问 · 云眼运营后台' }]
}

export default function ForbiddenRoute() {
  return (
    <main className="flex min-h-svh flex-col items-center justify-center gap-4 bg-background px-6 text-center">
      <p className="admin-display text-6xl font-semibold text-primary/80">403</p>
      <h1 className="text-xl font-medium">无权访问运营后台</h1>
      <p className="max-w-md text-sm text-muted-foreground">
        当前账号缺少 PLATFORM_ADMIN / TENANT_ADMIN 或相应 admin 权限码。
      </p>
      <Button nativeButton={false} render={<Link to="/login" />}>
        返回登录
      </Button>
    </main>
  )
}
