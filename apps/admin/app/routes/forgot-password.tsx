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

import type { Route } from './+types/forgot-password'

import './login.css'

const forgotPasswordSchema = z.object({
  email: z.string().min(1, '请输入邮箱').email('请输入有效邮箱'),
  tenantId: z.string().min(1, '请输入租户 slug'),
})

type ForgotPasswordFormValues = z.infer<typeof forgotPasswordSchema>

const adminLoginFieldInputClassName =
  'admin-login-input h-11 rounded-[10px] border-white/10 bg-[var(--admin-login-field-bg)] text-[var(--text-on-dark)] shadow-none placeholder:text-white/35 focus-visible:border-primary focus-visible:ring-[3px] focus-visible:ring-primary/30'

export function meta(_args: Route.MetaArgs) {
  return [{ title: '忘记密码 · 云眼运营后台' }]
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
  return null
}

export default function ForgotPasswordRoute() {
  const saasEnabled = isSaasAuthEnabled()
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
    if (!saasEnabled) {
      setSubmitError('未配置 VITE_API_URL，无法连接 SaaS 接口')
      return
    }

    setSubmitError(null)
    setSuccessMessage(null)
    try {
      await auth.requestPasswordReset({
        email: values.email.trim(),
        tenantId: values.tenantId.trim(),
        clientApp: 'admin',
      })
      setSuccessMessage('若该邮箱在指定租户下已注册，您将收到重置密码邮件，请查收。')
    } catch (error) {
      setSubmitError(formatLoginError(error))
    }
  }

  return (
    <div className="admin-login-page">
      <div className="admin-login-bg" aria-hidden="true" />
      <div className="admin-login-grid" aria-hidden="true" />

      <div className="admin-login-card">
        <p className="admin-login-kicker">Platform Console</p>
        <h1 className="admin-login-title">忘记密码</h1>
        <p className="mt-2 text-sm text-white/55">通过注册邮箱与租户 slug 申请重置链接</p>

        {!saasEnabled ? (
          <p className="mt-8 text-sm text-white/60">
            需配置 <code className="text-primary">VITE_API_URL</code> 并启动 SaaS API。
          </p>
        ) : (
          <form className="mt-8 space-y-4" onSubmit={handleSubmit(onSubmit)}>
            <div className="admin-login-field space-y-1.5" style={{ '--field-i': 0 } as CSSProperties}>
              <label className="text-sm text-white/65" htmlFor="admin-forgot-email">
                邮箱
              </label>
              <div className="relative">
                <UserIcon className="pointer-events-none absolute top-1/2 left-3 size-4 -translate-y-1/2 text-primary/55" />
                <Input
                  id="admin-forgot-email"
                  className={cn(adminLoginFieldInputClassName, 'pl-9')}
                  autoComplete="email"
                  placeholder="admin@demo.local"
                  type="email"
                  {...register('email')}
                />
              </div>
              {errors.email ? (
                <p className="text-xs text-red-300/90">{errors.email.message}</p>
              ) : null}
            </div>

            <div className="admin-login-field space-y-1.5" style={{ '--field-i': 1 } as CSSProperties}>
              <label className="text-sm text-white/65" htmlFor="admin-forgot-tenant">
                租户 slug
              </label>
              <div className="relative">
                <Building2Icon className="pointer-events-none absolute top-1/2 left-3 size-4 -translate-y-1/2 text-primary/55" />
                <Input
                  id="admin-forgot-tenant"
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

            {successMessage ? (
              <p className="rounded-lg border border-primary/25 bg-primary/10 px-3 py-2 text-sm text-white/85">
                {successMessage}
              </p>
            ) : null}

            {submitError ? (
              <p className="rounded-lg border border-red-400/25 bg-red-500/10 px-3 py-2 text-sm text-red-100/90">
                {submitError}
              </p>
            ) : null}

            <div className="admin-login-field pt-1" style={{ '--field-i': 2 } as CSSProperties}>
              <Button className="h-11 w-full rounded-[10px] text-base" disabled={isSubmitting} type="submit">
                {isSubmitting ? '发送中…' : '发送重置邮件'}
              </Button>
            </div>
          </form>
        )}

        <p className="mt-6 text-center text-sm text-white/45">
          <Link className="text-primary hover:underline" to="/login">
            返回登录
          </Link>
        </p>
      </div>
    </div>
  )
}
