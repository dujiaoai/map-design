import { isRouteErrorResponse, Links, Meta, Outlet, Scripts, ScrollRestoration } from 'react-router'

import { AppProviders } from '~/providers/app-providers'
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
  return (
    <div className="flex min-h-svh items-center justify-center bg-background text-foreground">
      <p className="text-sm text-muted-foreground">加载中…</p>
    </div>
  )
}

export default function App() {
  return (
    <AppProviders>
      <Outlet />
    </AppProviders>
  )
}

export function ErrorBoundary({ error }: Route.ErrorBoundaryProps) {
  let message = '出错了'
  let details = '发生了意外错误，请稍后重试。'
  let stack: string | undefined

  if (isRouteErrorResponse(error)) {
    message = error.status === 404 ? '404' : '错误'
    details = error.status === 404 ? '找不到请求的页面。' : error.statusText || details
  } else if (import.meta.env.DEV && error && error instanceof Error) {
    details = error.message
    stack = error.stack
  }

  return (
    <main className="flex min-h-svh flex-col items-center justify-center gap-4 bg-background px-6 text-foreground">
      <h1 className="text-2xl font-semibold">{message}</h1>
      <p className="text-sm text-muted-foreground">{details}</p>
      {stack && (
        <pre className="max-w-full overflow-x-auto rounded-md bg-muted p-4 text-xs">
          <code>{stack}</code>
        </pre>
      )}
    </main>
  )
}
