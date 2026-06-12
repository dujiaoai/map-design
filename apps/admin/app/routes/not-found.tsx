import { Button } from '@repo/ui'
import { Link } from 'react-router'

import { getAdminHomePath } from '~/shared/auth/admin-access'
import { auth } from '~/shared/auth/client'

import type { Route } from './+types/not-found'

export function meta(_args: Route.MetaArgs) {
  return [{ title: '页面未找到 · 云眼运营后台' }]
}

export async function clientLoader(_args: Route.ClientLoaderArgs) {
  throw new Response('页面未找到', { status: 404, statusText: 'Not Found' })
}

export default function NotFoundRoute() {
  auth.hydrateSession()
  const session = auth.getSession()
  const homePath = session ? getAdminHomePath(session) : '/login'
  const homeLabel = session ? '返回概览' : '返回登录'

  return (
    <main className="flex min-h-svh flex-col items-center justify-center gap-4 bg-background px-6 text-center">
      <p className="admin-display text-6xl font-semibold text-primary/80">404</p>
      <h1 className="text-xl font-medium">页面未找到</h1>
      <p className="max-w-md text-sm text-muted-foreground">
        您访问的地址不存在或已被移除，请检查链接后重试。
      </p>
      <Button nativeButton={false} render={<Link to={homePath} />}>
        {homeLabel}
      </Button>
    </main>
  )
}
