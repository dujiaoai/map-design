import { Button } from '@repo/ui'
import { Link } from 'react-router'

import type { Route } from './+types/forbidden'

export function meta(_args: Route.MetaArgs) {
  return [{ title: '无权访问 · 云眼地图' }]
}

export default function ForbiddenRoute() {
  return (
    <main className="flex min-h-svh flex-col items-center justify-center gap-4 bg-background px-6 text-center">
      <p className="text-6xl font-semibold text-primary/75">403</p>
      <h1 className="text-xl font-medium text-foreground">无权访问工作台</h1>
      <p className="max-w-md text-sm text-muted-foreground">
        当前账号缺少 <code className="font-mono text-xs">workspace:use</code>{' '}
        权限。请联系租户管理员在运营后台调整角色权限。
      </p>
      <Button nativeButton={false} render={<Link to="/login" />}>
        返回登录
      </Button>
    </main>
  )
}
