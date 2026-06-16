import { standardSchemaResolver } from '@hookform/resolvers/standard-schema'
import { isLoginMfaRequiredError } from '@repo/auth'
import { Button, cn, Input } from '@repo/ui'
import { useQuery } from '@tanstack/react-query'
import { Building2Icon, LockIcon, UserIcon } from 'lucide-react'
import { useEffect, useState, type CSSProperties } from 'react'
import { useForm } from 'react-hook-form'
import { Link, useLocation, useNavigate, useSearchParams } from 'react-router'
import { z } from 'zod'

import { resolvePermissionsForRoles } from '@repo/auth'

import { fetchOidcProviders, startOidcAuthorize } from '~/shared/api/oidc-auth'
import { auth, SaaSRole } from '~/shared/auth/client'
import { formatLoginError } from '~/shared/auth/format-login-error'
import { isSaasAuthEnabled } from '~/shared/config/saas-auth-enabled'
import {
  clearRememberLogin,
  loadRememberLogin,
  saveRememberLogin,
} from '~/shared/lib/remember-login'
import { MOCK_ACCESS_TOKEN } from '~/shared/mock/dev-auth'
import { PasswordInput } from '~/shared/ui/password-input'

import {
  authCheckboxClassName,
  authErrorBannerClassName,
  authFieldInputClassName,
  AuthFieldError,
  authGuestClientLoader,
  authInlineNoticeClassName,
  authLabelClassName,
  authLinkClassName,
  authMonoHintClassName,
  authMutedTextClassName,
  authPageLinks,
  AuthPageShell,
  authSubtleTextClassName,
} from './auth-page-chrome'
import type { Route } from './+types/login'

import './login.css'

const saasLoginFormSchema = z.object({
  email: z.string().min(1, '请输入邮箱').email('请输入有效邮箱'),
  password: z.string().min(1, '请输入密码'),
  tenantId: z.string().trim().optional(),
})

const devLoginFormSchema = z.object({
  username: z.string().min(1, '请输入您的账号'),
  password: z.string().min(1, '请输入您的密码'),
})

type SaasLoginFormValues = z.infer<typeof saasLoginFormSchema>
type DevLoginFormValues = z.infer<typeof devLoginFormSchema>

const saasAuthEnabled = isSaasAuthEnabled()

function isValidMfaCode(code: string) {
  const trimmed = code.trim()
  if (/^\d{6}$/.test(trimmed)) {
    return true
  }
  const normalized = trimmed.replace(/[\s-]/g, '').toUpperCase()
  return /^[A-Z2-9]{8}$/.test(normalized)
}

function resolveUserEmail(username: string): string {
  return username.includes('@') ? username : `${username}@yunyan.local`
}

export function meta(_args: Route.MetaArgs) {
  return [{ title: '登录 · 云眼地图工作台' }]
}

export const links: Route.LinksFunction = () => authPageLinks()

export async function clientLoader() {
  return authGuestClientLoader()
}

function SaasLoginForm() {
  const navigate = useNavigate()
  const location = useLocation()
  const [searchParams] = useSearchParams()
  const [rememberMe, setRememberMe] = useState(false)
  const [submitError, setSubmitError] = useState<string | null>(null)
  const [mfaChallenge, setMfaChallenge] = useState<{ token: string; email?: string } | null>(null)
  const [mfaCode, setMfaCode] = useState('')
  const [isMfaSubmitting, setIsMfaSubmitting] = useState(false)
  const [oidcStartingProviderId, setOidcStartingProviderId] = useState<string | null>(null)
  const switchTenantSlug = searchParams.get('tenant')?.trim()
  const switchTenantReason = searchParams.get('reason')

  const oidcQuery = useQuery({
    queryKey: ['auth', 'oidc', 'providers'],
    queryFn: fetchOidcProviders,
    enabled: !mfaChallenge,
    staleTime: 60_000,
  })

  const {
    register,
    handleSubmit,
    reset,
    watch,
    formState: { errors, isSubmitting },
  } = useForm<SaasLoginFormValues>({
    resolver: standardSchemaResolver(saasLoginFormSchema),
    defaultValues: { email: '', password: '', tenantId: '' },
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

    reset({
      email: saved?.username ?? '',
      password: saved?.password ?? '',
      tenantId: switchTenantSlug || saved?.tenantId || '',
    })
    if (saved) {
      setRememberMe(saved.rememberMe)
    }
  }, [reset, switchTenantSlug])

  async function onSubmit(values: SaasLoginFormValues) {
    setSubmitError(null)

    const email = values.email.trim()
    const tenantId = values.tenantId?.trim()

    if (rememberMe) {
      saveRememberLogin(email, values.password, tenantId || '')
    } else {
      clearRememberLogin()
    }

    try {
      await auth.login({
        email,
        password: values.password,
        ...(tenantId ? { tenantId } : {}),
      })
      void navigate('/', { replace: true })
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
    if (!mfaChallenge || !isValidMfaCode(mfaCode)) return

    setIsMfaSubmitting(true)
    setSubmitError(null)
    try {
      await auth.completeLoginMfa({
        mfaChallengeToken: mfaChallenge.token,
        code: mfaCode.trim(),
      })
      void navigate('/', { replace: true })
    } catch (error) {
      setSubmitError(formatLoginError(error))
    } finally {
      setIsMfaSubmitting(false)
    }
  }

  async function onStartOidc(providerId: string) {
    const tenantId = tenantIdValue?.trim()
    if (!tenantId) {
      setSubmitError('企业账号登录请先填写租户标识')
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

  if (mfaChallenge) {
    return (
      <form className="login-form-fields" onSubmit={onSubmitMfa}>
        <p className={authInlineNoticeClassName}>
          账号 {mfaChallenge.email ?? '已验证'} 已启用二次验证，请输入验证器 6 位码或恢复码。
        </p>
        <div className="login-field-group space-y-1.5" style={{ '--field-i': 0 } as CSSProperties}>
          <label className={authLabelClassName} htmlFor="web-mfa-code">
            动态验证码 / 恢复码
          </label>
          <Input
            id="web-mfa-code"
            className={authFieldInputClassName}
            autoComplete="off"
            placeholder="000000 或 XXXX-XXXX"
            value={mfaCode}
            onChange={(event) => setMfaCode(event.target.value.toUpperCase())}
          />
        </div>
        {submitError ? <p className={authErrorBannerClassName}>{submitError}</p> : null}
        <div className="login-field-group" style={{ '--field-i': 1 } as CSSProperties}>
          <Button
            className="mt-1 h-11 w-full rounded-[10px] text-base font-medium"
            disabled={isMfaSubmitting || !isValidMfaCode(mfaCode)}
            type="submit"
          >
            {isMfaSubmitting ? '验证中…' : '完成登录'}
          </Button>
        </div>
        <button
          type="button"
          className={cn('text-sm', authLinkClassName)}
          onClick={() => {
            setMfaChallenge(null)
            setMfaCode('')
            setSubmitError(null)
          }}
        >
          返回密码登录
        </button>
      </form>
    )
  }

  return (
    <form className="login-form-fields" onSubmit={handleSubmit(onSubmit)}>
      {switchTenantReason === 'switch' ? (
        <p className={authInlineNoticeClassName}>
          请重新登录以切换到租户「{switchTenantSlug || '目标租户'}」
        </p>
      ) : null}

      <div className="login-field-group space-y-1.5" style={{ '--field-i': 0 } as CSSProperties}>
        <label className={authLabelClassName} htmlFor="login-email">
          邮箱
        </label>
        <div className="relative">
          <UserIcon className="login-field-icon pointer-events-none absolute top-1/2 left-3 size-4 -translate-y-1/2 text-primary/50" />
          <Input
            id="login-email"
            autoComplete="email"
            className={cn(authFieldInputClassName, 'pl-9')}
            placeholder="admin@demo.local"
            type="email"
            {...register('email')}
          />
        </div>
        <AuthFieldError message={errors.email?.message} />
      </div>

      <div className="login-field-group space-y-1.5" style={{ '--field-i': 1 } as CSSProperties}>
        <label className={authLabelClassName} htmlFor="login-password">
          密码
        </label>
        <PasswordInput
          id="login-password"
          autoComplete="current-password"
          className={authFieldInputClassName}
          leadingIcon={<LockIcon className="size-4" />}
          placeholder="请输入密码"
          {...register('password')}
        />
        <AuthFieldError message={errors.password?.message} />
      </div>

      <div className="login-field-group space-y-1.5" style={{ '--field-i': 2 } as CSSProperties}>
        <label className={authLabelClassName} htmlFor="login-tenant">
          租户（个人版可留空）
        </label>
        <div className="relative">
          <Building2Icon className="login-field-icon pointer-events-none absolute top-1/2 left-3 size-4 -translate-y-1/2 text-primary/50" />
          <Input
            id="login-tenant"
            autoComplete="organization"
            className={cn(authFieldInputClassName, 'pl-9')}
            placeholder="团队标识；仅个人空间时留空"
            {...register('tenantId')}
          />
        </div>
        <AuthFieldError message={errors.tenantId?.message} />
      </div>

      <div
        className="login-field-group flex items-center justify-between gap-3 pt-0.5"
        style={{ '--field-i': 3 } as CSSProperties}
      >
        <label className="flex cursor-pointer select-none items-center gap-2">
          <input
            checked={rememberMe}
            type="checkbox"
            className={authCheckboxClassName}
            onChange={(event) => setRememberMe(event.target.checked)}
          />
          <span className={authSubtleTextClassName}>记住密码</span>
        </label>
        <Link className={cn('shrink-0 text-sm', authLinkClassName)} to="/forgot-password">
          忘记密码？
        </Link>
      </div>

      {submitError ? (
        <p className={authErrorBannerClassName}>
          {submitError}
        </p>
      ) : null}

      <div className="login-field-group" style={{ '--field-i': 4 } as CSSProperties}>
        <Button
          className="mt-1 h-11 w-full rounded-[10px] text-base font-medium"
          disabled={isSubmitting}
          type="submit"
        >
          {isSubmitting ? '登录中…' : '登录'}
        </Button>
      </div>

      {oidcQuery.data?.enabled && oidcQuery.data.authorizationCodeFlowAvailable ? (
        <div className="login-field-group space-y-2" style={{ '--field-i': 5 } as CSSProperties}>
          <p className={cn('text-center text-xs', authSubtleTextClassName)}>或使用企业账号</p>
          {oidcQuery.data.providers.map((provider) => (
            <Button
              key={provider.id}
              type="button"
              variant="outline"
              className="h-10 w-full rounded-[10px] text-sm"
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
      ) : null}

      <p className={cn('text-center', authMutedTextClassName)}>
        没有账号？{' '}
        <Link className={authLinkClassName} to="/register">
          创建组织
        </Link>
        {' · '}
        <Link className={authLinkClassName} to="/register?mode=personal">
          注册个人版
        </Link>
      </p>

      <p className={authMonoHintClassName}>
        SaaS API · 演示账号 admin@demo.local / demo（默认密码 password，改密后请用新密码）
      </p>
    </form>
  )
}

function DevLoginForm() {
  const navigate = useNavigate()
  const [rememberMe, setRememberMe] = useState(false)

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors, isSubmitting },
  } = useForm<DevLoginFormValues>({
    resolver: standardSchemaResolver(devLoginFormSchema),
    defaultValues: { username: '', password: '' },
  })

  useEffect(() => {
    const saved = loadRememberLogin()
    if (!saved) return

    reset({
      username: saved.username,
      password: saved.password,
    })
    setRememberMe(saved.rememberMe)
  }, [reset])

  function onSubmit(values: DevLoginFormValues) {
    if (rememberMe) {
      saveRememberLogin(values.username, values.password)
    } else {
      clearRememberLogin()
    }

    const username = values.username.trim()

    auth.devLogin(
      {
        user: {
          id: username,
          email: resolveUserEmail(username),
          name: username,
          roles: [SaaSRole.MEMBER],
          permissions: resolvePermissionsForRoles([SaaSRole.MEMBER]),
        },
        tenant: null,
      },
      { accessToken: MOCK_ACCESS_TOKEN },
    )

    void navigate('/', { replace: true })
  }

  return (
    <form className="login-form-fields" onSubmit={handleSubmit(onSubmit)}>
      <div className="login-field-group space-y-1.5" style={{ '--field-i': 0 } as CSSProperties}>
        <label className={authLabelClassName} htmlFor="login-username">
          账号
        </label>
        <div className="relative">
          <UserIcon className="login-field-icon pointer-events-none absolute top-1/2 left-3 size-4 -translate-y-1/2 text-primary/50" />
          <Input
            id="login-username"
            autoComplete="username"
            className={cn(authFieldInputClassName, 'pl-9')}
            placeholder="请输入账号"
            {...register('username')}
          />
        </div>
        <AuthFieldError message={errors.username?.message} />
      </div>

      <div className="login-field-group space-y-1.5" style={{ '--field-i': 1 } as CSSProperties}>
        <label className={authLabelClassName} htmlFor="login-dev-password">
          密码
        </label>
        <PasswordInput
          id="login-dev-password"
          autoComplete="current-password"
          className={authFieldInputClassName}
          leadingIcon={<LockIcon className="size-4" />}
          placeholder="请输入密码"
          {...register('password')}
        />
        <AuthFieldError message={errors.password?.message} />
      </div>

      <div
        className="login-field-group flex items-center justify-between gap-3 pt-0.5"
        style={{ '--field-i': 2 } as CSSProperties}
      >
        <label className="flex cursor-pointer select-none items-center gap-2">
          <input
            checked={rememberMe}
            type="checkbox"
            className={authCheckboxClassName}
            onChange={(event) => setRememberMe(event.target.checked)}
          />
          <span className={authSubtleTextClassName}>记住密码</span>
        </label>
      </div>

      <div className="login-field-group" style={{ '--field-i': 3 } as CSSProperties}>
        <Button
          className="mt-1 h-11 w-full rounded-[10px] text-base font-medium"
          disabled={isSubmitting}
          type="submit"
        >
          {isSubmitting ? '登录中…' : '登录'}
        </Button>
      </div>

      <p className={authMonoHintClassName}>
        MOCK · 任意账号 / 密码均可登录（未配置 VITE_API_URL）
      </p>
    </form>
  )
}

export default function Login() {
  return (
    <AuthPageShell
      badge={saasAuthEnabled ? 'SaaS API' : '开发模式'}
      brandDescription="测绘、巡检、分析与协同 —— 在统一工作台中完成。侧栏导航、地图工具链与业务 Dock 深度耦合，为 GIS 专业团队而生。"
      headline="探索空间维度"
      headlineAccent="掌控每一像素"
      subtitle="验证身份后进入地图工作台"
      title="欢迎登录"
    >
      {saasAuthEnabled ? <SaasLoginForm /> : <DevLoginForm />}
    </AuthPageShell>
  )
}
