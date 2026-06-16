import { isLoginMfaRequiredError } from '@repo/auth'
import { Button } from '@repo/ui'
import { useEffect, useState } from 'react'
import { Link, useNavigate, useParams, useSearchParams } from 'react-router'

import { auth } from '~/shared/auth/client'

import {
  authBodyTextClassName,
  authGuestClientLoader,
  authPageLinks,
  AuthPageShell,
} from './auth-page-chrome'
import type { Route } from './+types/auth.oidc.callback.$providerId'

import './login.css'

export function meta(_args: Route.MetaArgs) {
  return [{ title: 'OIDC 登录 · 云眼地图工作台' }]
}

export const links: Route.LinksFunction = () => authPageLinks()

export async function clientLoader() {
  return authGuestClientLoader()
}

export default function OidcCallbackRoute() {
  const navigate = useNavigate()
  const { providerId } = useParams()
  const [searchParams] = useSearchParams()
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    async function completeLogin() {
      const code = searchParams.get('code')
      const state = searchParams.get('state')
      if (!providerId || !code || !state) {
        setError('缺少 OIDC 回调参数')
        return
      }
      try {
        await auth.completeOidcLogin({ providerId, code, state })
        void navigate('/', { replace: true })
      } catch (err) {
        if (isLoginMfaRequiredError(err)) {
          void navigate('/login', {
            replace: true,
            state: { mfaChallengeToken: err.challengeToken, email: err.userEmail },
          })
          return
        }
        setError('OIDC 登录失败，请返回重试')
      }
    }
    void completeLogin()
  }, [navigate, providerId, searchParams])

  return (
    <AuthPageShell
      badge="SaaS API"
      brandDescription="正在验证企业身份提供方回调…"
      headline="探索空间维度"
      headlineAccent="掌控每一像素"
      subtitle="OIDC 授权回调"
      title={error ? '登录未完成' : '正在登录'}
    >
      <div className="login-form-fields space-y-4">
        <p className={authBodyTextClassName}>{error ?? '正在完成 OIDC 登录，请稍候…'}</p>
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
