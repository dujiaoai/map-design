import {
  isLoginMfaRequiredError,
  loginResponseSchema,
  loginResponseToSession,
  loginResponseToTokenPair,
} from '@repo/auth'
import { Button } from '@repo/ui'
import { useEffect, useState } from 'react'
import { Link, useNavigate, useParams, useSearchParams } from 'react-router'

import { completeTenantSsoCallback } from '~/shared/api/tenant-sso'
import { auth } from '~/shared/auth/client'

import {
  authBodyTextClassName,
  authGuestClientLoader,
  authPageLinks,
  AuthPageShell,
} from './auth-page-chrome'
import type { Route } from './+types/auth.tenant-sso.callback.$slug'

import './login.css'

export function meta(_args: Route.MetaArgs) {
  return [{ title: '租户 SSO 登录 · 云眼地图工作台' }]
}

export const links: Route.LinksFunction = () => authPageLinks()

export async function clientLoader() {
  return authGuestClientLoader()
}

export default function TenantSsoCallbackRoute() {
  const navigate = useNavigate()
  const { slug } = useParams()
  const [searchParams] = useSearchParams()
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    async function completeLogin() {
      const code = searchParams.get('code')
      const state = searchParams.get('state')
      if (!slug || !code || !state) {
        setError('缺少租户 SSO 回调参数')
        return
      }
      try {
        const raw = await completeTenantSsoCallback(slug, code, state)
        if (raw.mfaRequired && raw.mfaChallengeToken) {
          void navigate('/login', {
            replace: true,
            state: { mfaChallengeToken: raw.mfaChallengeToken, email: raw.user.email },
          })
          return
        }
        const response = loginResponseSchema.parse(raw)
        if (!response.accessToken || !response.refreshToken) {
          setError('租户 SSO 登录响应缺少 token')
          return
        }
        auth.setSession(loginResponseToSession(response), loginResponseToTokenPair(response))
        void navigate('/', { replace: true })
      } catch (err) {
        if (isLoginMfaRequiredError(err)) {
          void navigate('/login', {
            replace: true,
            state: { mfaChallengeToken: err.challengeToken, email: err.userEmail },
          })
          return
        }
        setError('租户 SSO 登录失败，请返回重试')
      }
    }
    void completeLogin()
  }, [navigate, slug, searchParams])

  return (
    <AuthPageShell
      badge="SaaS API"
      brandDescription="正在验证租户身份提供方回调…"
      headline="探索空间维度"
      headlineAccent="掌控每一像素"
      subtitle="租户 SSO 授权回调"
      title={error ? '登录未完成' : '正在登录'}
    >
      <div className="login-form-fields space-y-4">
        <p className={authBodyTextClassName}>{error ?? '正在完成租户 SSO 登录，请稍候…'}</p>
        {error ? (
          <Button
            className="h-11 w-full rounded-[10px]"
            nativeButton={false}
            render={<Link to="/login" />}
          >
            返回登录
          </Button>
        ) : null}
      </div>
    </AuthPageShell>
  )
}
