import { standardSchemaResolver } from '@hookform/resolvers/standard-schema'
import { isLoginMfaRequiredError } from '@repo/auth'
import { Button, Checkbox, cn, Input } from '@repo/ui'
import { useQuery } from '@tanstack/react-query'
import { Building2Icon, UserIcon } from 'lucide-react'
import { useEffect, useState, type CSSProperties } from 'react'
import { useForm } from 'react-hook-form'
import { Link, redirect, useLocation, useNavigate } from 'react-router'
import { z } from 'zod'

import { auth } from '~/shared/auth/client'
import { fetchOidcProviders, startOidcAuthorize } from '~/shared/api/admin-api'
import { getAdminHomePath, hasAdminAccess } from '~/shared/auth/admin-access'
import { resolveAdminLoginReturnTo } from '~/shared/auth/resolve-login-return-to'
import {
  clearRememberLogin,
  loadRememberLogin,
  saveRememberLogin,
} from '~/shared/lib/remember-login'
import { formatLoginError } from '~/shared/auth/format-login-error'
import { adminBrand } from '~/shared/config/admin-brand'
import { isSaasAuthEnabled } from '~/shared/config/saas-auth-enabled'
import { PasswordInput } from '~/shared/ui/password-input'

import type { Route } from './+types/login'

import './login.css'

const loginSchema = z.object({
  email: z.string().min(1, '请输入邮箱').email('请输入有效邮箱'),
  password: z.string().min(1, '请输入密码'),
  tenantId: z.string().min(1, '请输入租户 slug'),
})

type LoginFormValues = z.infer<typeof loginSchema>

function isValidAdminMfaCode(code: string) {
  const trimmed = code.trim()
  if (/^\d{6}$/.test(trimmed)) {
    return true
  }
  const normalized = trimmed.replace(/[\s-]/g, '').toUpperCase()
  return /^[A-Z2-9]{8}$/.test(normalized)
}

const adminLoginFieldInputClassName =
  'admin-login-input h-11 rounded-[10px] border-white/10 bg-[var(--admin-login-field-bg)] text-[var(--text-on-dark)] shadow-none placeholder:text-white/35 focus-visible:border-primary focus-visible:ring-[3px] focus-visible:ring-primary/30'

export function meta(_args: Route.MetaArgs) {
  return [{ title: `登录 · ${adminBrand.appName}` }]
}

export function links() {
  return [
    { rel: 'preconnect', href: 'https://fonts.googleapis.com' },
    { rel: 'preconnect', href: 'https://fonts.gstatic.com', crossOrigin: 'anonymous' as const },
    {
      rel: 'stylesheet',
      href: 'https://fonts.googleapis.com/css2?family=IBM+Plex+Mono:wght@400;500&family=Noto+Sans+SC:wght@400;500;600&family=Syne:wght@500;600;700&display=swap',
    },
  ]
}

export async function clientLoader() {
  auth.hydrateSession()
  const session = auth.getSession()
  if (session && hasAdminAccess(session)) {
    throw redirect(getAdminHomePath(session))
  }
  return null
}

export default function LoginRoute() {
  const navigate = useNavigate()
  const location = useLocation()
  const returnTo = resolveAdminLoginReturnTo(
    new URLSearchParams(location.search).get('returnTo'),
  )
  const [rememberMe, setRememberMe] = useState(false)
  const [submitError, setSubmitError] = useState<string | null>(null)
  const [mfaChallenge, setMfaChallenge] = useState<{ token: string; email?: string } | null>(
    null,
  )
  const [mfaCode, setMfaCode] = useState('')
  const [isMfaSubmitting, setIsMfaSubmitting] = useState(false)
  const [oidcStartingProviderId, setOidcStartingProviderId] = useState<string | null>(null)
  const saasEnabled = isSaasAuthEnabled()

  const oidcQuery = useQuery({
    queryKey: ['auth', 'oidc', 'providers'],
    queryFn: fetchOidcProviders,
    enabled: saasEnabled && !mfaChallenge,
    staleTime: 60_000,
  })

  const {
    register,
    handleSubmit,
    reset,
    watch,
    formState: { errors, isSubmitting },
  } = useForm<LoginFormValues>({
    resolver: standardSchemaResolver(loginSchema),
    defaultValues: { email: '', password: '', tenantId: 'demo' },
  })

  const tenantIdValue = watch('tenantId')

  useEffect(() => {
    const state = location.state as { mfaChallengeToken?: string; email?: string } | null
    if (!state?.mfaChallengeToken) return
    setMfaChallenge({ token: state.mfaChallengeToken, email: state.email })
    window.history.replaceState({}, document.title)
  }, [location.state])

  useEffect(() => {
    const saved = loadRememberLogin()
    if (!saved) return

    reset({
      email: saved.email,
      password: saved.password,
      tenantId: saved.tenantSlug ?? 'demo',
    })
    setRememberMe(true)
  }, [reset])

  async function onSubmit(values: LoginFormValues) {
    if (!saasEnabled) {
      setSubmitError('未配置 VITE_API_URL，无法连接 SaaS 登录接口')
      return
    }

    setSubmitError(null)
    try {
      const email = values.email.trim()
      const tenantId = values.tenantId.trim()
      await auth.login({
        email,
        password: values.password,
        tenantId,
      })
      if (rememberMe) {
        saveRememberLogin(email, values.password, tenantId)
      } else {
        clearRememberLogin()
      }
      void navigate(returnTo ?? getAdminHomePath(auth.getSession()), { replace: true })
    } catch (error) {
      if (isLoginMfaRequiredError(error)) {
        setMfaChallenge({ token: error.challengeToken, email: error.userEmail })
        setSubmitError(null)
        return
      }
      setSubmitError(formatLoginError(error))
    }
  }

  async function onSubmitMfa(event: React.FormEvent) {
    event.preventDefault()
    if (!mfaChallenge || !isValidAdminMfaCode(mfaCode)) return

    setIsMfaSubmitting(true)
    setSubmitError(null)
    try {
      await auth.completeLoginMfa({
        mfaChallengeToken: mfaChallenge.token,
        code: mfaCode.trim(),
      })
      void navigate(returnTo ?? getAdminHomePath(auth.getSession()), { replace: true })
    } catch (error) {
      setSubmitError(formatLoginError(error))
    } finally {
      setIsMfaSubmitting(false)
    }
  }

  async function onStartOidc(providerId: string) {
    if (!saasEnabled) {
      setSubmitError('未配置 VITE_API_URL，无法连接 SaaS 登录接口')
      return
    }
    const tenantId = tenantIdValue.trim()
    if (!tenantId) {
      setSubmitError('请先填写租户 slug')
      return
    }
    setSubmitError(null)
    setOidcStartingProviderId(providerId)
    try {
      const { authorizationUrl } = await startOidcAuthorize(providerId, tenantId)
      window.location.assign(authorizationUrl)
    } catch (error) {
      setSubmitError(formatLoginError(error))
      setOidcStartingProviderId(null)
    }
  }

  return (
    <div className="admin-login-page">
      <div className="admin-login-bg" aria-hidden="true" />
      <div className="admin-login-grid" aria-hidden="true" />

      <div className="admin-login-card">
        <p className="admin-login-kicker">{adminBrand.loginEyebrow}</p>
        <h1 className="admin-login-title">{adminBrand.loginTitle}</h1>
        <p className="mt-2 text-sm text-white/55">PLATFORM_ADMIN / TENANT_ADMIN 账号</p>

        <form
          className="mt-8 space-y-4"
          onSubmit={mfaChallenge ? onSubmitMfa : handleSubmit(onSubmit)}
        >
          {mfaChallenge ? (
            <div className="admin-login-field space-y-4" style={{ '--field-i': 0 } as CSSProperties}>
              <p className="text-sm text-white/65">
                账号 {mfaChallenge.email ?? '已验证'} 已启用 TOTP，请输入验证器 6 位码或恢复码。
              </p>
              <div className="space-y-1.5">
                <label className="text-sm text-white/65" htmlFor="admin-mfa-code">
                  动态验证码 / 恢复码
                </label>
                <Input
                  id="admin-mfa-code"
                  className={adminLoginFieldInputClassName}
                  autoComplete="off"
                  placeholder="000000 或 XXXX-XXXX"
                  value={mfaCode}
                  onChange={(event) => setMfaCode(event.target.value.toUpperCase())}
                />
              </div>
              {submitError ? (
                <p className="rounded-lg border border-red-400/25 bg-red-500/10 px-3 py-2 text-sm text-red-100/90">
                  {submitError}
                </p>
              ) : null}
              <Button
                className="h-11 w-full rounded-[10px] text-base"
                disabled={isMfaSubmitting || !isValidAdminMfaCode(mfaCode)}
                type="submit"
              >
                {isMfaSubmitting ? '验证中…' : '完成登录'}
              </Button>
              <button
                type="button"
                className="text-xs text-primary hover:underline"
                onClick={() => {
                  setMfaChallenge(null)
                  setMfaCode('')
                  setSubmitError(null)
                }}
              >
                返回密码登录
              </button>
            </div>
          ) : (
            <>
          <div className="admin-login-field space-y-1.5" style={{ '--field-i': 0 } as CSSProperties}>
            <label className="text-sm text-white/65" htmlFor="admin-email">
              邮箱
            </label>
            <div className="relative">
              <UserIcon className="pointer-events-none absolute top-1/2 left-3 size-4 -translate-y-1/2 text-primary/55" />
              <Input
                id="admin-email"
                className={cn(adminLoginFieldInputClassName, 'pl-9')}
                autoComplete="email"
                placeholder="admin@demo.local"
                type="email"
                {...register('email')}
              />
            </div>
            {errors.email ? <p className="text-xs text-red-300/90">{errors.email.message}</p> : null}
          </div>

          <div className="admin-login-field space-y-1.5" style={{ '--field-i': 1 } as CSSProperties}>
            <label className="text-sm text-white/65" htmlFor="admin-password">
              密码
            </label>
            <PasswordInput
              id="admin-password"
              autoComplete="current-password"
              className={adminLoginFieldInputClassName}
              leadingIcon
              placeholder="password"
              {...register('password')}
            />
            {errors.password ? (
              <p className="text-xs text-red-300/90">{errors.password.message}</p>
            ) : null}
          </div>

          <div className="admin-login-field space-y-1.5" style={{ '--field-i': 2 } as CSSProperties}>
            <div className="flex items-center justify-between gap-2">
              <label className="text-sm text-white/65" htmlFor="admin-tenant">
                租户 slug
              </label>
              <Link className="shrink-0 text-xs text-primary hover:underline" to="/forgot-password">
                忘记密码？
              </Link>
            </div>
            <div className="relative">
              <Building2Icon className="pointer-events-none absolute top-1/2 left-3 size-4 -translate-y-1/2 text-primary/55" />
              <Input
                id="admin-tenant"
                className={cn(adminLoginFieldInputClassName, 'pl-9')}
                autoComplete="organization"
                placeholder="demo"
                {...register('tenantId')}
              />
            </div>
            {errors.tenantId ? (
              <p className="text-xs text-red-300/90">{errors.tenantId.message}</p>
            ) : null}
          </div>

          <label className="admin-login-field flex cursor-pointer select-none items-center gap-2 text-sm text-white/60" style={{ '--field-i': 3 } as CSSProperties}>
            <Checkbox
              checked={rememberMe}
              onCheckedChange={(value) => setRememberMe(value === true)}
              className="border-white/25 bg-white/5 shadow-none data-checked:border-primary data-checked:bg-primary dark:bg-white/5"
            />
            记住密码
          </label>

          {submitError ? (
            <p className="rounded-lg border border-red-400/25 bg-red-500/10 px-3 py-2 text-sm text-red-100/90">
              {submitError}
            </p>
          ) : null}

          <div className="admin-login-field pt-1" style={{ '--field-i': 4 } as CSSProperties}>
            <Button className="h-11 w-full rounded-[10px] text-base" disabled={isSubmitting} type="submit">
              {isSubmitting ? '登录中…' : '进入控制台'}
            </Button>
          </div>
          {oidcQuery.data?.enabled && oidcQuery.data.authorizationCodeFlowAvailable ? (
            <div className="admin-login-field space-y-2 pt-1" style={{ '--field-i': 5 } as CSSProperties}>
              <p className="text-center text-xs text-white/45">或使用企业账号</p>
              {oidcQuery.data.providers.map((provider) => (
                <Button
                  key={provider.id}
                  type="button"
                  variant="outline"
                  className="h-10 w-full rounded-[10px] border-white/15 bg-white/5 text-sm text-white/85 hover:bg-white/10"
                  disabled={Boolean(oidcStartingProviderId) || isSubmitting}
                  onClick={() => {
                    void onStartOidc(provider.id)
                  }}
                >
                  {oidcStartingProviderId === provider.id
                    ? '跳转 IdP…'
                    : `使用 ${provider.displayName} 登录`}
                </Button>
              ))}
            </div>
          ) : oidcQuery.data?.enabled ? (
            <p className="text-center text-xs text-white/45">
              已配置 {oidcQuery.data.providers.length} 个 OIDC IdP；授权码登录即将开放，请暂用邮箱密码。
            </p>
          ) : null}
            </>
          )}
        </form>

        <p className="mt-6 text-center font-mono text-[11px] text-white/38">
          SaaS API · admin@demo.local / demo / password
        </p>
      </div>
    </div>
  )
}
