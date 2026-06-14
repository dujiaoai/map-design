import { standardSchemaResolver } from '@hookform/resolvers/standard-schema'
import { Button, cn, Input } from '@repo/ui'
import { Building2Icon, LockIcon, UserIcon } from 'lucide-react'
import { useEffect, useState, type CSSProperties } from 'react'
import { useForm } from 'react-hook-form'
import { Link, useNavigate, useSearchParams } from 'react-router'
import { z } from 'zod'

import { resolvePermissionsForRoles } from '@repo/auth'

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
  const [searchParams] = useSearchParams()
  const [rememberMe, setRememberMe] = useState(false)
  const [submitError, setSubmitError] = useState<string | null>(null)
  const switchTenantSlug = searchParams.get('tenant')?.trim()
  const switchTenantReason = searchParams.get('reason')

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors, isSubmitting },
  } = useForm<SaasLoginFormValues>({
    resolver: standardSchemaResolver(saasLoginFormSchema),
    defaultValues: { email: '', password: '', tenantId: '' },
  })

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
      setSubmitError(formatLoginError(error))
    }
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
