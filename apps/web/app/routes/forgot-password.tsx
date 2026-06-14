import { standardSchemaResolver } from '@hookform/resolvers/standard-schema'
import { Button, cn, Input } from '@repo/ui'
import { Building2Icon, UserIcon } from 'lucide-react'
import { useState, type CSSProperties } from 'react'
import { useForm } from 'react-hook-form'
import { Link } from 'react-router'
import { z } from 'zod'

import { auth } from '~/shared/auth/client'
import { formatLoginError } from '~/shared/auth/format-login-error'
import { isSaasAuthEnabled } from '~/shared/config/saas-auth-enabled'

import {
  authBodyTextClassName,
  authErrorBannerClassName,
  authSuccessBannerClassName,
  authFieldInputClassName,
  AuthFieldError,
  authGuestClientLoader,
  authLabelClassName,
  authLinkClassName,
  authMutedTextClassName,
  authPageLinks,
  AuthPageShell,
} from './auth-page-chrome'
import type { Route } from './+types/forgot-password'

import './login.css'

const forgotPasswordSchema = z.object({
  email: z.string().min(1, '请输入邮箱').email('请输入有效邮箱'),
  tenantId: z.string().min(1, '请输入租户标识'),
})

type ForgotPasswordFormValues = z.infer<typeof forgotPasswordSchema>

export function meta(_args: Route.MetaArgs) {
  return [{ title: '忘记密码 · 云眼地图工作台' }]
}

export const links: Route.LinksFunction = () => authPageLinks()

export async function clientLoader() {
  return authGuestClientLoader()
}

function ForgotPasswordForm() {
  const [submitError, setSubmitError] = useState<string | null>(null)
  const [successMessage, setSuccessMessage] = useState<string | null>(null)

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<ForgotPasswordFormValues>({
    resolver: standardSchemaResolver(forgotPasswordSchema),
    defaultValues: { email: '', tenantId: 'demo' },
  })

  async function onSubmit(values: ForgotPasswordFormValues) {
    setSubmitError(null)
    setSuccessMessage(null)
    try {
      await auth.requestPasswordReset({
        email: values.email.trim(),
        tenantId: values.tenantId.trim(),
      })
      setSuccessMessage('若该邮箱在指定租户下已注册，您将收到重置密码邮件，请查收。')
    } catch (error) {
      setSubmitError(formatLoginError(error))
    }
  }

  return (
    <form className="login-form-fields" onSubmit={handleSubmit(onSubmit)}>
      <div className="login-field-group space-y-1.5" style={{ '--field-i': 0 } as CSSProperties}>
        <label className={authLabelClassName} htmlFor="forgot-email">
          邮箱
        </label>
        <div className="relative">
          <UserIcon className="login-field-icon pointer-events-none absolute top-1/2 left-3 size-4 -translate-y-1/2 text-primary/50" />
          <Input
            id="forgot-email"
            autoComplete="email"
            className={cn(authFieldInputClassName, 'pl-9')}
            type="email"
            {...register('email')}
          />
        </div>
        <AuthFieldError message={errors.email?.message} />
      </div>

      <div className="login-field-group space-y-1.5" style={{ '--field-i': 1 } as CSSProperties}>
        <label className={authLabelClassName} htmlFor="forgot-tenant">
          租户标识
        </label>
        <div className="relative">
          <Building2Icon className="login-field-icon pointer-events-none absolute top-1/2 left-3 size-4 -translate-y-1/2 text-primary/50" />
          <Input
            id="forgot-tenant"
            autoComplete="organization"
            className={cn(authFieldInputClassName, 'pl-9')}
            {...register('tenantId')}
          />
        </div>
        <AuthFieldError message={errors.tenantId?.message} />
      </div>

      {successMessage ? (
        <p className={authSuccessBannerClassName}>
          {successMessage}
        </p>
      ) : null}

      {submitError ? (
        <p className={authErrorBannerClassName}>
          {submitError}
        </p>
      ) : null}

      <div className="login-field-group" style={{ '--field-i': 2 } as CSSProperties}>
        <Button
          className="mt-1 h-11 w-full rounded-[10px] text-base font-medium"
          disabled={isSubmitting || Boolean(successMessage)}
          type="submit"
        >
          {isSubmitting ? '发送中…' : '发送重置邮件'}
        </Button>
      </div>

      <p className={cn('text-center', authMutedTextClassName)}>
        想起密码了？{' '}
        <Link className={authLinkClassName} to="/login">
          返回登录
        </Link>
      </p>
    </form>
  )
}

function ForgotPasswordUnavailable() {
  return (
    <div className="login-form-fields space-y-4">
      <p className={authBodyTextClassName}>
        密码重置需配置 <code className="text-brand dark:text-brand-light">VITE_API_URL</code> 并启动 SaaS API。
      </p>
      <Button className="h-11 w-full rounded-[10px]" nativeButton={false} render={<Link to="/login" />}>
        返回登录
      </Button>
    </div>
  )
}

export default function ForgotPasswordRoute() {
  const saasAuthEnabled = isSaasAuthEnabled()

  return (
    <AuthPageShell
      badge={saasAuthEnabled ? 'SaaS API' : '未启用'}
      brandDescription="通过注册邮箱与租户标识申请重置链接，无需管理员介入。"
      headline="找回访问权限"
      headlineAccent="安全重置您的密码"
      subtitle="链接 1 小时内有效"
      title="忘记密码"
    >
      {saasAuthEnabled ? <ForgotPasswordForm /> : <ForgotPasswordUnavailable />}
    </AuthPageShell>
  )
}
