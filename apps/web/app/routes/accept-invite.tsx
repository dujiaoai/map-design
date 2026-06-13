import { standardSchemaResolver } from '@hookform/resolvers/standard-schema'
import { authPasswordFieldSchema } from '@repo/auth'
import { Button, cn } from '@repo/ui'
import { useState, type CSSProperties } from 'react'
import { useForm } from 'react-hook-form'
import { Link, useNavigate, useSearchParams } from 'react-router'
import { z } from 'zod'

import { auth } from '~/shared/auth/client'
import { formatLoginError } from '~/shared/auth/format-login-error'
import { isSaasAuthEnabled } from '~/shared/config/saas-auth-enabled'
import { PasswordInput } from '~/shared/ui/password-input'

import {
  authFieldInputClassName,
  AuthFieldError,
  authGuestClientLoader,
  authPageLinks,
  AuthPageShell,
} from './auth-page-chrome'
import type { Route } from './+types/accept-invite'

import './login.css'

const acceptInviteSchema = z
  .object({
    password: authPasswordFieldSchema(),
    confirmPassword: z.string().min(1, '请确认密码'),
  })
  .refine((values) => values.password === values.confirmPassword, {
    message: '两次输入的密码不一致',
    path: ['confirmPassword'],
  })

type AcceptInviteFormValues = z.infer<typeof acceptInviteSchema>

export function meta(_args: Route.MetaArgs) {
  return [{ title: '接受邀请 · 云眼地图工作台' }]
}

export const links: Route.LinksFunction = () => authPageLinks()

export async function clientLoader() {
  return authGuestClientLoader()
}

function AcceptInviteForm({ token }: { token: string }) {
  const navigate = useNavigate()
  const [submitError, setSubmitError] = useState<string | null>(null)

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<AcceptInviteFormValues>({
    resolver: standardSchemaResolver(acceptInviteSchema),
    defaultValues: { password: '', confirmPassword: '' },
  })

  async function onSubmit(values: AcceptInviteFormValues) {
    setSubmitError(null)
    try {
      await auth.acceptInvite({ token, password: values.password })
      void navigate('/', { replace: true })
    } catch (error) {
      setSubmitError(formatLoginError(error))
    }
  }

  return (
    <form className="login-form-fields" onSubmit={handleSubmit(onSubmit)}>
      <div className="login-field-group space-y-1.5" style={{ '--field-i': 0 } as CSSProperties}>
        <label className="text-sm font-medium text-white/70" htmlFor="accept-password">
          设置密码
        </label>
        <PasswordInput
          id="accept-password"
          autoComplete="new-password"
          className={cn(authFieldInputClassName)}
          {...register('password')}
        />
        <AuthFieldError message={errors.password?.message} />
      </div>

      <div className="login-field-group space-y-1.5" style={{ '--field-i': 1 } as CSSProperties}>
        <label className="text-sm font-medium text-white/70" htmlFor="accept-confirm">
          确认密码
        </label>
        <PasswordInput
          id="accept-confirm"
          autoComplete="new-password"
          className={cn(authFieldInputClassName)}
          {...register('confirmPassword')}
        />
        <AuthFieldError message={errors.confirmPassword?.message} />
      </div>

      {submitError ? (
        <p className="rounded-lg border border-red-400/30 bg-red-500/10 px-3 py-2 text-sm text-red-200/90">
          {submitError}
        </p>
      ) : null}

      <div className="login-field-group" style={{ '--field-i': 2 } as CSSProperties}>
        <Button
          className="mt-1 h-11 w-full rounded-[10px] text-base font-medium"
          disabled={isSubmitting}
          type="submit"
        >
          {isSubmitting ? '激活中…' : '激活并进入工作台'}
        </Button>
      </div>

      <p className="text-center text-sm text-white/50">
        已有账号？{' '}
        <Link className="text-brand-light hover:underline" to="/login">
          去登录
        </Link>
      </p>
    </form>
  )
}

function AcceptInviteUnavailable() {
  return (
    <div className="login-form-fields space-y-4">
      <p className="text-sm leading-relaxed text-white/60">
        接受邀请需配置 <code className="text-brand-light">VITE_API_URL</code> 并启动 SaaS API。
      </p>
      <Button className="h-11 w-full rounded-[10px]" nativeButton={false} render={<Link to="/login" />}>
        返回登录
      </Button>
    </div>
  )
}

function MissingTokenNotice() {
  return (
    <div className="login-form-fields space-y-4">
      <p className="rounded-lg border border-amber-400/30 bg-amber-500/10 px-3 py-2 text-sm text-amber-100/90">
        缺少邀请 token，请从邮件中的完整链接打开本页。链接 48 小时内有效。
      </p>
      <p className="text-center text-sm text-white/50">
        已有账号？{' '}
        <Link className="text-brand-light hover:underline" to="/login">
          去登录
        </Link>
      </p>
    </div>
  )
}

export default function AcceptInviteRoute() {
  const [searchParams] = useSearchParams()
  const token = searchParams.get('token')?.trim() ?? ''
  const saasAuthEnabled = isSaasAuthEnabled()

  return (
    <AuthPageShell
      badge={saasAuthEnabled ? 'SaaS API' : '未启用'}
      brandDescription="通过管理员邀请链接设置密码并激活账号，加入团队协作空间。"
      headline="加入协作空间"
      headlineAccent="设置密码完成激活"
      subtitle="邀请链接 48 小时内有效"
      title="接受邀请"
    >
      {!saasAuthEnabled ? (
        <AcceptInviteUnavailable />
      ) : !token ? (
        <MissingTokenNotice />
      ) : (
        <AcceptInviteForm token={token} />
      )}
    </AuthPageShell>
  )
}
