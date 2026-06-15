import { isRouteErrorResponse, Links, Meta, Outlet, Scripts, ScrollRestoration, Link } from 'react-router'
import { Button } from '@repo/ui'

import { AppProviders } from '~/providers/app-providers'
import { AdminErrorPage, AdminLoadingPage } from '~/shared/ui/admin-error-page'
import { themeInitScript } from '~/shared/lib/theme'
import type { Route } from './+types/root'
import './app.css'

export const links: Route.LinksFunction = () => [{ rel: 'icon', href: '/favicon.ico' }]

export function Layout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="zh-CN" suppressHydrationWarning>
      <head>
        <meta charSet="utf-8" />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <script dangerouslySetInnerHTML={{ __html: themeInitScript }} />
        <Meta />
        <Links />
      </head>
      <body>
        {children}
        <ScrollRestoration />
        <Scripts />
      </body>
    </html>
  )
}

export function HydrateFallback() {
  return <AdminLoadingPage />
}

export default function App() {
  return (
    <AppProviders>
      <Outlet />
    </AppProviders>
  )
}

export function ErrorBoundary({ error }: Route.ErrorBoundaryProps) {
  let code = '500'
  let title = '出错了'
  let details = '发生了意外错误，请稍后重试。'

  if (isRouteErrorResponse(error)) {
    code = String(error.status)
    title = error.status === 404 ? '页面未找到' : '请求失败'
    details =
      error.status === 404
        ? '找不到请求的页面，请检查链接后重试。'
        : error.statusText || details
  } else if (import.meta.env.DEV && error instanceof Error) {
    details = error.message
  }

  return (
    <AdminErrorPage
      code={code}
      title={title}
      description={details}
      actions={
        <>
          <Button type="button" onClick={() => window.location.reload()}>
            重试
          </Button>
          <Button nativeButton={false} variant="outline" render={<Link to="/" />}>
            返回概览
          </Button>
        </>
      }
    />
  )
}
