import { Button } from '@repo/ui'
import { useCallback, useState } from 'react'

import { api } from '~/shared/api/client'
import { auth } from '~/shared/auth/client'
import { env } from '~/shared/config/env'
import { resolveSaasApiBaseUrl } from '~/shared/config/saas-api-base-url'

type StepResult = {
  label: string
  ok: boolean
  detail: string
}

const DEMO = {
  email: 'admin@demo.local',
  password: 'password',
  tenantId: 'demo',
} as const

export default function DevSaasAuthSmokeRoute() {
  const [results, setResults] = useState<StepResult[]>([])
  const [busy, setBusy] = useState(false)

  const push = useCallback((step: StepResult) => {
    setResults((prev) => [...prev, step])
  }, [])

  const runLogin = useCallback(async () => {
    setBusy(true)
    try {
      const session = await auth.login(DEMO)
      push({
        label: 'auth.login()',
        ok: true,
        detail: `${session.user.email} · ${session.user.roles.join(', ')}`,
      })
    } catch (e) {
      push({
        label: 'auth.login()',
        ok: false,
        detail: e instanceof Error ? e.message : String(e),
      })
    } finally {
      setBusy(false)
    }
  }, [push])

  const runUsersMe = useCallback(async () => {
    setBusy(true)
    try {
      const data = await api.get<{ user: { email: string; roles: string[] } }>('/users/me')
      push({
        label: 'GET /users/me',
        ok: true,
        detail: `${data.user.email} · ${data.user.roles.join(', ')}`,
      })
    } catch (e) {
      push({
        label: 'GET /users/me',
        ok: false,
        detail: e instanceof Error ? e.message : String(e),
      })
    } finally {
      setBusy(false)
    }
  }, [push])

  const runRefresh = useCallback(async () => {
    setBusy(true)
    try {
      const token = await auth.refreshAccessToken()
      push({
        label: 'auth.refreshAccessToken()',
        ok: Boolean(token),
        detail: token ? `新 access token 前 16 位: ${token.slice(0, 16)}…` : '返回 null',
      })
    } catch (e) {
      push({
        label: 'auth.refreshAccessToken()',
        ok: false,
        detail: e instanceof Error ? e.message : String(e),
      })
    } finally {
      setBusy(false)
    }
  }, [push])

  if (!import.meta.env.DEV) {
    return (
      <main className="mx-auto max-w-lg p-8">
        <p className="text-muted-foreground">此页面仅在开发环境可用。</p>
      </main>
    )
  }

  const apiBase = env.VITE_API_URL ? resolveSaasApiBaseUrl(env.VITE_API_URL) : null

  return (
    <main className="mx-auto flex max-w-lg flex-col gap-6 p-8">
      <div>
        <h1 className="text-xl font-semibold">SaaS Auth 冒烟</h1>
        <p className="mt-2 text-sm text-muted-foreground">
          独立验证 <code className="text-foreground">@repo/auth</code> +{' '}
          <code className="text-foreground">@repo/api-client</code>，不经过 RuoYi 登录页。
        </p>
      </div>

      <dl className="grid gap-2 text-sm">
        <div className="flex gap-2">
          <dt className="text-muted-foreground">VITE_API_URL</dt>
          <dd className="font-mono">{env.VITE_API_URL ?? '（未设置）'}</dd>
        </div>
        <div className="flex gap-2">
          <dt className="text-muted-foreground">解析后基址</dt>
          <dd className="font-mono">{apiBase ?? '—'}</dd>
        </div>
        <div className="flex gap-2">
          <dt className="text-muted-foreground">演示账号</dt>
          <dd className="font-mono">
            {DEMO.email} / {DEMO.tenantId}
          </dd>
        </div>
      </dl>

      {!env.VITE_API_URL ? (
        <p className="rounded-md border border-amber-500/40 bg-amber-500/10 p-3 text-sm">
          请在仓库根 <code>.env</code> 设置 <code>VITE_API_URL=/v1</code> 并重启 dev server。
        </p>
      ) : null}

      <div className="flex flex-wrap gap-2">
        <Button type="button" disabled={busy || !env.VITE_API_URL} onClick={runLogin}>
          1. SaaS 登录
        </Button>
        <Button type="button" variant="secondary" disabled={busy || !env.VITE_API_URL} onClick={runUsersMe}>
          2. GET /users/me
        </Button>
        <Button type="button" variant="secondary" disabled={busy || !env.VITE_API_URL} onClick={runRefresh}>
          3. 刷新 Token
        </Button>
        <Button
          type="button"
          variant="outline"
          disabled={busy || !env.VITE_API_URL}
          onClick={() => {
            setResults([])
          }}
        >
          清空日志
        </Button>
      </div>

      {results.length > 0 ? (
        <ol className="space-y-2 text-sm">
          {results.map((r, i) => (
            <li
              key={`${r.label}-${i}`}
              className={
                r.ok
                  ? 'rounded-md border border-emerald-500/30 bg-emerald-500/10 p-3'
                  : 'rounded-md border border-destructive/40 bg-destructive/10 p-3'
              }
            >
              <span className="font-medium">{r.ok ? '✓' : '✗'} {r.label}</span>
              <pre className="mt-1 whitespace-pre-wrap font-mono text-xs">{r.detail}</pre>
            </li>
          ))}
        </ol>
      ) : null}
    </main>
  )
}
