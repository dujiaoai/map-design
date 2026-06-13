import { standardSchemaResolver } from '@hookform/resolvers/standard-schema'
import { authPasswordFieldSchema } from '@repo/auth'
import { Button, cn, Input } from '@repo/ui'
import { Building2Icon, UserIcon } from 'lucide-react'
import { useState, type CSSProperties } from 'react'
import { useForm } from 'react-hook-form'
import { Link, useNavigate } from 'react-router'
import { z } from 'zod'

import { auth } from '~/shared/auth/client'
import { formatRegisterError } from '~/shared/auth/format-register-error'
import { isSaasAuthEnabled } from '~/shared/config/saas-auth-enabled'
import { PasswordInput } from '~/shared/ui/password-input'

import {
  authFieldInputClassName,
  AuthFieldError,
  authGuestClientLoader,
  authPageLinks,
  AuthPageShell,
} from './auth-page-chrome'
import type { Route } from './+types/register'

import './login.css'

const registerFormSchema = z
  .object({
    email: z.string().min(1, '请输入邮箱').email('请输入有效邮箱'),
    password: authPasswordFieldSchema(),
    confirmPassword: z.string().min(1, '请确认密码'),
    tenantId: z.string().min(1, '请输入租户标识'),
    displayName: z.string().optional(),
  })
  .refine((values) => values.password === values.confirmPassword, {
    message: '两次输入的密码不一致',
    path: ['confirmPassword'],
  })

type RegisterFormValues = z.infer<typeof registerFormSchema>

export function meta(_args: Route.MetaArgs) {
  return [{ title: '注册 · 云眼地图工作台' }]
}

export function links(_args: Route.LinksArgs) {
  return authPageLinks()
}

export async function clientLoader() {
  return authGuestClientLoader()
}

function RegisterUnavailable() {
  return (
    <div className="login-form-fields space-y-4">
      <p className="text-sm leading-relaxed text-white/60">
        注册需配置 <code className="text-brand-light">VITE_API_URL</code> 并启动 SaaS API。本地开发请在根目录
        `.env` 设置 <code className="text-brand-light">VITE_API_URL=/v1</code>。
      </p>
      <Button asChild className="h-11 w-full rounded-[10px]">
        <Link to="/login">返回登录</Link>
      </Button>
    </div>
  )
}

function RegisterForm() {
  const navigate = useNavigate()
  const [submitError, setSubmitError] = useState<string | null>(null)

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<RegisterFormValues>({
    resolver: standardSchemaResolver(registerFormSchema),
    defaultValues: {
      email: '',
      password: '',
      confirmPassword: '',
      tenantId: 'demo',
      displayName: '',
    },
  })

  async function onSubmit(values: RegisterFormValues) {
    setSubmitError(null)

    const email = values.email.trim()
    const tenantId = values.tenantId.trim()
    const displayName = values.displayName?.trim()

    try {
      await auth.register({
        email,
        password: values.password,
        tenantId,
        displayName: displayName || undefined,
      })
      void navigate('/', { replace: true })
    } catch (error) {
      setSubmitError(formatRegisterError(error))
    }
  }

  return (
    <form className="login-form-fields" onSubmit={handleSubmit(onSubmit)}>
      <div className="login-field-group space-y-1.5" style={{ '--field-i': 0 } as CSSProperties}>
        <label className="text-sm font-medium text-white/70" htmlFor="register-email">
          邮箱
        </label>
        <div className="relative">
          <UserIcon className="login-field-icon pointer-events-none absolute top-1/2 left-3 size-4 -translate-y-1/2 text-primary/50" />
          <Input
            id="register-email"
            autoComplete="email"
            className={cn(authFieldInputClassName, 'pl-9')}
            placeholder="you@demo.local"
            type="email"
            {...register('email')}
          />
        </div>
        <AuthFieldError message={errors.email?.message} />
      </div>

      <div className="login-field-group space-y-1.5" style={{ '--field-i': 1 } as CSSProperties}>
        <label className="text-sm font-medium text-white/70" htmlFor="register-display-name">
          显示名（可选）
        </label>
        <Input
          id="register-display-name"
          autoComplete="name"
          className={authFieldInputClassName}
          placeholder="留空则使用邮箱前缀"
          {...register('displayName')}
        />
        <AuthFieldError message={errors.displayName?.message} />
      </div>

      <div className="login-field-group space-y-1.5" style={{ '--field-i': 2 } as CSSProperties}>
        <label className="text-sm font-medium text-white/70" htmlFor="register-password">
          密码
        </label>
        <PasswordInput
          id="register-password"
          autoComplete="new-password"
          className={authFieldInputClassName}
          placeholder="至少 8 位"
          {...register('password')}
        />
        <AuthFieldError message={errors.password?.message} />
      </div>

      <div className="login-field-group space-y-1.5" style={{ '--field-i': 3 } as CSSProperties}>
        <label className="text-sm font-medium text-white/70" htmlFor="register-confirm-password">
          确认密码
        </label>
        <PasswordInput
          id="register-confirm-password"
          autoComplete="new-password"
          className={authFieldInputClassName}
          placeholder="再次输入密码"
          {...register('confirmPassword')}
        />
        <AuthFieldError message={errors.confirmPassword?.message} />
      </div>

      <div className="login-field-group space-y-1.5" style={{ '--field-i': 4 } as CSSProperties}>
        <label className="text-sm font-medium text-white/70" htmlFor="register-tenant">
          租户
        </label>
        <div className="relative">
          <Building2Icon className="login-field-icon pointer-events-none absolute top-1/2 left-3 size-4 -translate-y-1/2 text-primary/50" />
          <Input
            id="register-tenant"
            autoComplete="organization"
            className={cn(authFieldInputClassName, 'pl-9')}
            placeholder="demo"
            {...register('tenantId')}
          />
        </div>
        <AuthFieldError message={errors.tenantId?.message} />
      </div>

      {submitError ? (
        <p className="rounded-lg border border-red-400/30 bg-red-500/10 px-3 py-2 text-sm text-red-200/90">
          {submitError}
        </p>
      ) : null}

      <div className="login-field-group" style={{ '--field-i': 5 } as CSSProperties}>
        <Button
          className="mt-1 h-11 w-full rounded-[10px] text-base font-medium"
          disabled={isSubmitting}
          type="submit"
        >
          {isSubmitting ? '注册中…' : '注册并进入工作台'}
        </Button>
      </div>

      <p className="text-center text-sm text-white/50">
        已有账号？{' '}
        <Link className="text-brand-light hover:underline" to="/login">
          去登录
        </Link>
      </p>

      <p className="cc-mono text-center text-[11px] leading-relaxed text-white/38">
        加入已有租户 · 默认角色 MEMBER · 演示租户 slug: demo
      </p>
    </form>
  )
}

export default function Register() {
  const saasAuthEnabled = isSaasAuthEnabled()

  return (
    <AuthPageShell
      badge={saasAuthEnabled ? 'SaaS API' : '未启用'}
      brandDescription="注册即加入指定租户，获得地图工作台访问权限。首版无邮箱验证，请使用有效租户 slug。"
      headline="加入协作空间"
      headlineAccent="开启地图工作台之旅"
      subtitle="创建账号并加入租户"
      title="注册账号"
    >
      {saasAuthEnabled ? <RegisterForm /> : <RegisterUnavailable />}
    </AuthPageShell>
  )
}
