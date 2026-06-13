import { standardSchemaResolver } from '@hookform/resolvers/standard-schema'
import { Button, cn, Input } from '@repo/ui'
import { Building2Icon, UserIcon } from 'lucide-react'
import { useEffect, useState, type CSSProperties } from 'react'
import { useForm } from 'react-hook-form'
import { Link, useSearchParams } from 'react-router'
import { z } from 'zod'

import { authEmailFieldSchema, authTenantIdFieldSchema } from '~/shared/auth/auth-form-schema'
import { auth } from '~/shared/auth/client'
import { formatLoginError } from '~/shared/auth/format-login-error'
import { isSaasAuthEnabled } from '~/shared/config/saas-auth-enabled'

import {
  authFieldInputClassName,
  AuthFieldError,
  authGuestClientLoader,
  authPageLinks,
  AuthPageShell,
} from './auth-page-chrome'
import type { Route } from './+types/resend-verification'

import './login.css'

const resendVerificationSchema = z.object({
  email: authEmailFieldSchema,
  tenantId: authTenantIdFieldSchema,
})

type ResendVerificationFormValues = z.infer<typeof resendVerificationSchema>

function fieldA11y(errorMessage: string | undefined, errorId: string) {
  return {
    'aria-describedby': errorMessage ? errorId : undefined,
    'aria-invalid': errorMessage ? true : undefined,
  } as const
}

export function meta(_args: Route.MetaArgs) {
  return [{ title: '重发验证邮件 · 云眼地图工作台' }]
}

export const links: Route.LinksFunction = () => authPageLinks()

export async function clientLoader() {
  return authGuestClientLoader()
}

function ResendVerificationForm() {
  const [searchParams] = useSearchParams()
  const emailFromUrl = searchParams.get('email')?.trim().toLowerCase()
  const tenantFromUrl = searchParams.get('tenant')?.trim()
  const [submitError, setSubmitError] = useState<string | null>(null)
  const [successMessage, setSuccessMessage] = useState<string | null>(null)

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors, isSubmitting },
  } = useForm<ResendVerificationFormValues>({
    resolver: standardSchemaResolver(resendVerificationSchema),
    defaultValues: { email: '', tenantId: 'demo' },
  })

  useEffect(() => {
    reset({
      email: emailFromUrl ?? '',
      tenantId: tenantFromUrl || 'demo',
    })
  }, [emailFromUrl, reset, tenantFromUrl])

  async function onSubmit(values: ResendVerificationFormValues) {
    setSubmitError(null)
    setSuccessMessage(null)
    try {
      await auth.resendRegistrationVerification({
        email: values.email,
        tenantId: values.tenantId,
      })
      setSuccessMessage('若该邮箱在指定租户下有待验证账号，您将收到新的验证邮件，请查收。')
    } catch (error) {
      setSubmitError(formatLoginError(error))
    }
  }

  return (
    <form className="login-form-fields" onSubmit={handleSubmit(onSubmit)}>
      <div className="login-field-group space-y-1.5" style={{ '--field-i': 0 } as CSSProperties}>
        <label className="text-sm font-medium text-white/70" htmlFor="resend-email">
          邮箱
        </label>
        <div className="relative">
          <UserIcon className="login-field-icon pointer-events-none absolute top-1/2 left-3 size-4 -translate-y-1/2 text-primary/50" />
          <Input
            id="resend-email"
            autoComplete="email"
            className={cn(authFieldInputClassName, 'pl-9')}
            placeholder="you@demo.local"
            type="email"
            {...fieldA11y(errors.email?.message, 'resend-email-error')}
            {...register('email')}
          />
        </div>
        <AuthFieldError id="resend-email-error" message={errors.email?.message} />
      </div>

      <div className="login-field-group space-y-1.5" style={{ '--field-i': 1 } as CSSProperties}>
        <label className="text-sm font-medium text-white/70" htmlFor="resend-tenant">
          租户标识
        </label>
        <div className="relative">
          <Building2Icon className="login-field-icon pointer-events-none absolute top-1/2 left-3 size-4 -translate-y-1/2 text-primary/50" />
          <Input
            id="resend-tenant"
            autoComplete="organization"
            className={cn(authFieldInputClassName, 'pl-9')}
            placeholder="demo"
            {...fieldA11y(errors.tenantId?.message, 'resend-tenant-error')}
            {...register('tenantId')}
          />
        </div>
        <AuthFieldError id="resend-tenant-error" message={errors.tenantId?.message} />
      </div>

      {successMessage ? (
        <p
          className="rounded-lg border border-primary/30 bg-primary/10 px-3 py-2 text-sm text-primary-foreground/90"
          role="status"
          aria-live="polite"
        >
          {successMessage}
        </p>
      ) : null}

      {submitError ? (
        <p
          className="rounded-lg border border-red-400/30 bg-red-500/10 px-3 py-2 text-sm text-red-200/90"
          role="alert"
        >
          {submitError}
        </p>
      ) : null}

      <div className="login-field-group" style={{ '--field-i': 2 } as CSSProperties}>
        <Button
          className="mt-1 h-11 w-full rounded-[10px] text-base font-medium"
          disabled={isSubmitting}
          type="submit"
        >
          {isSubmitting ? '发送中…' : '重发验证邮件'}
        </Button>
      </div>

      <p className="text-center text-sm text-white/50">
        <Link className="text-brand-light hover:underline" to="/register">
          重新注册
        </Link>
        {' · '}
        <Link className="text-brand-light hover:underline" to="/login">
          返回登录
        </Link>
      </p>
    </form>
  )
}

function ResendVerificationUnavailable() {
  return (
    <div className="login-form-fields space-y-4">
      <p className="text-sm leading-relaxed text-white/60">
        重发验证邮件需配置 <code className="text-brand-light">VITE_API_URL</code> 并启动 SaaS API。
      </p>
      <Button className="h-11 w-full rounded-[10px]" nativeButton={false} render={<Link to="/login" />}>
        返回登录
      </Button>
    </div>
  )
}

export default function ResendVerificationRoute() {
  const saasAuthEnabled = isSaasAuthEnabled()

  return (
    <AuthPageShell
      badge={saasAuthEnabled ? 'SaaS API' : '未启用'}
      brandDescription="注册后未收到验证邮件？填写注册邮箱与租户标识即可申请重发。"
      headline="完成注册"
      headlineAccent="重发邮箱验证链接"
      subtitle="验证链接 24 小时内有效"
      title="重发验证邮件"
    >
      {saasAuthEnabled ? <ResendVerificationForm /> : <ResendVerificationUnavailable />}
    </AuthPageShell>
  )
}
