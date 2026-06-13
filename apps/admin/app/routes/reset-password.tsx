import { standardSchemaResolver } from '@hookform/resolvers/standard-schema'
import { authPasswordFieldSchema } from '@repo/auth'
import { Button, cn } from '@repo/ui'
import { useState, type CSSProperties } from 'react'
import { useForm } from 'react-hook-form'
import { Link, useNavigate, useSearchParams } from 'react-router'
import { z } from 'zod'

import { auth } from '~/shared/auth/client'
import { getAdminHomePath } from '~/shared/auth/admin-access'
import { formatLoginError } from '~/shared/auth/format-login-error'
import { isSaasAuthEnabled } from '~/shared/config/saas-auth-enabled'
import { PasswordInput } from '~/shared/ui/password-input'

import type { Route } from './+types/reset-password'

import './login.css'

const resetPasswordSchema = z
  .object({
    password: authPasswordFieldSchema(),
    confirmPassword: z.string().min(1, '请确认密码'),
  })
  .refine((values) => values.password === values.confirmPassword, {
    message: '两次输入的密码不一致',
    path: ['confirmPassword'],
  })

type ResetPasswordFormValues = z.infer<typeof resetPasswordSchema>

const adminLoginFieldInputClassName =
  'admin-login-input h-11 rounded-[10px] border-white/10 bg-[var(--admin-login-field-bg)] text-[var(--text-on-dark)] shadow-none placeholder:text-white/35 focus-visible:border-primary focus-visible:ring-[3px] focus-visible:ring-primary/30'

export function meta(_args: Route.MetaArgs) {
  return [{ title: '重置密码 · 云眼运营后台' }]
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

function ResetPasswordForm({ token }: { token: string }) {
  const navigate = useNavigate()
  const [submitError, setSubmitError] = useState<string | null>(null)

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<ResetPasswordFormValues>({
    resolver: standardSchemaResolver(resetPasswordSchema),
    defaultValues: { password: '', confirmPassword: '' },
  })

  async function onSubmit(values: ResetPasswordFormValues) {
    setSubmitError(null)
    try {
      await auth.confirmPasswordReset({ token, password: values.password })
      void navigate(getAdminHomePath(auth.getSession()), { replace: true })
    } catch (error) {
      setSubmitError(formatLoginError(error))
    }
  }

  return (
    <form className="mt-8 space-y-4" onSubmit={handleSubmit(onSubmit)}>
      <div className="admin-login-field space-y-1.5" style={{ '--field-i': 0 } as CSSProperties}>
        <label className="text-sm text-white/65" htmlFor="admin-reset-password">
          新密码
        </label>
        <PasswordInput
          id="admin-reset-password"
          autoComplete="new-password"
          className={cn(adminLoginFieldInputClassName)}
          leadingIcon
          {...register('password')}
        />
        {errors.password ? (
          <p className="text-xs text-red-300/90">{errors.password.message}</p>
        ) : null}
      </div>

      <div className="admin-login-field space-y-1.5" style={{ '--field-i': 1 } as CSSProperties}>
        <label className="text-sm text-white/65" htmlFor="admin-reset-confirm">
          确认新密码
        </label>
        <PasswordInput
          id="admin-reset-confirm"
          autoComplete="new-password"
          className={cn(adminLoginFieldInputClassName)}
          leadingIcon
          {...register('confirmPassword')}
        />
        {errors.confirmPassword ? (
          <p className="text-xs text-red-300/90">{errors.confirmPassword.message}</p>
        ) : null}
      </div>

      {submitError ? (
        <p className="rounded-lg border border-red-400/25 bg-red-500/10 px-3 py-2 text-sm text-red-100/90">
          {submitError}
        </p>
      ) : null}

      <div className="admin-login-field pt-1" style={{ '--field-i': 2 } as CSSProperties}>
        <Button className="h-11 w-full rounded-[10px] text-base" disabled={isSubmitting} type="submit">
          {isSubmitting ? '保存中…' : '重置并进入控制台'}
        </Button>
      </div>
    </form>
  )
}

export default function ResetPasswordRoute() {
  const [searchParams] = useSearchParams()
  const token = searchParams.get('token')?.trim() ?? ''
  const saasEnabled = isSaasAuthEnabled()

  return (
    <div className="admin-login-page">
      <div className="admin-login-bg" aria-hidden="true" />
      <div className="admin-login-grid" aria-hidden="true" />

      <div className="admin-login-card">
        <p className="admin-login-kicker">Platform Console</p>
        <h1 className="admin-login-title">重置密码</h1>
        <p className="mt-2 text-sm text-white/55">通过邮件链接设置新密码，完成后自动登录</p>

        {!saasEnabled ? (
          <p className="mt-8 text-sm text-white/60">
            需配置 <code className="text-primary">VITE_API_URL</code> 并启动 SaaS API。
          </p>
        ) : !token ? (
          <div className="mt-8 space-y-4">
            <p className="rounded-lg border border-amber-400/25 bg-amber-500/10 px-3 py-2 text-sm text-amber-100/90">
              缺少重置 token，请从邮件中的完整链接打开本页。
            </p>
            <p className="text-center text-sm text-white/45">
              <Link className="text-primary hover:underline" to="/forgot-password">
                重新申请重置邮件
              </Link>
            </p>
          </div>
        ) : (
          <ResetPasswordForm token={token} />
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
