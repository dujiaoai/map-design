import { Button } from '@repo/ui'
import { useEffect, useState } from 'react'
import { Link, useNavigate, useSearchParams } from 'react-router'

import { auth } from '~/shared/auth/client'
import { formatLoginError } from '~/shared/auth/format-login-error'
import { isSaasAuthEnabled } from '~/shared/config/saas-auth-enabled'

import {
  authBodyTextClassName,
  authErrorBannerClassName,
  authGuestClientLoader,
  authLinkClassName,
  authMutedTextClassName,
  authPageLinks,
  AuthPageShell,
  authSuccessBannerClassName,
  authWarningBannerClassName,
} from './auth-page-chrome'
import type { Route } from './+types/verify-email'

import './login.css'

export function meta(_args: Route.MetaArgs) {
  return [{ title: '验证邮箱 · 云眼地图工作台' }]
}

export const links: Route.LinksFunction = () => authPageLinks()

export async function clientLoader() {
  return authGuestClientLoader()
}

function VerifyEmailPending() {
  return <p className={authBodyTextClassName}>正在验证邮箱并登录，请稍候…</p>
}

function VerifyEmailSuccess() {
  return <p className={authSuccessBannerClassName}>邮箱已验证，正在进入工作台…</p>
}

function VerifyEmailError({ message }: { message: string }) {
  return (
    <div className="login-form-fields space-y-4">
      <p className={authErrorBannerClassName}>{message}</p>
      <Button className="h-11 w-full rounded-[10px]" nativeButton={false} render={<Link to="/register" />}>
        重新注册
      </Button>
      <p className={authMutedTextClassName}>
        <Link className={authLinkClassName} to="/login">
          返回登录
        </Link>
      </p>
    </div>
  )
}

function MissingTokenNotice() {
  return (
    <div className="login-form-fields space-y-4">
      <p className={authWarningBannerClassName}>
        缺少验证 token，请从注册邮件中的完整链接打开本页。
      </p>
      <p className={authMutedTextClassName}>
        <Link className={authLinkClassName} to="/register">
          去注册
        </Link>
      </p>
    </div>
  )
}

export default function VerifyEmailRoute() {
  const navigate = useNavigate()
  const [searchParams] = useSearchParams()
  const token = searchParams.get('token')?.trim() ?? ''
  const saasAuthEnabled = isSaasAuthEnabled()
  const [status, setStatus] = useState<'pending' | 'success' | 'error'>('pending')
  const [errorMessage, setErrorMessage] = useState<string | null>(null)

  useEffect(() => {
    if (!saasAuthEnabled || !token) return

    let cancelled = false

    async function verify() {
      try {
        await auth.confirmRegistration(token)
        if (cancelled) return
        setStatus('success')
        window.setTimeout(() => {
          void navigate('/', { replace: true })
        }, 800)
      } catch (error) {
        if (cancelled) return
        setStatus('error')
        setErrorMessage(formatLoginError(error))
      }
    }

    void verify()

    return () => {
      cancelled = true
    }
  }, [navigate, saasAuthEnabled, token])

  return (
    <AuthPageShell
      badge={saasAuthEnabled ? 'SaaS API' : '未启用'}
      brandDescription="点击注册邮件中的链接即可激活账号并进入工作台。"
      headline="加入协作空间"
      headlineAccent="验证邮箱完成注册"
      subtitle="验证链接 24 小时内有效"
      title="验证邮箱"
    >
      {!saasAuthEnabled ? (
        <div className="login-form-fields space-y-4">
          <p className={authBodyTextClassName}>
            邮箱验证需配置 <code className="text-brand dark:text-brand-light">VITE_API_URL</code> 并启动 SaaS API。
          </p>
          <Button className="h-11 w-full rounded-[10px]" nativeButton={false} render={<Link to="/login" />}>
            返回登录
          </Button>
        </div>
      ) : !token ? (
        <MissingTokenNotice />
      ) : status === 'error' ? (
        <VerifyEmailError message={errorMessage ?? '验证失败'} />
      ) : status === 'success' ? (
        <VerifyEmailSuccess />
      ) : (
        <VerifyEmailPending />
      )}
    </AuthPageShell>
  )
}
