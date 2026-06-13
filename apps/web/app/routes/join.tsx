import { standardSchemaResolver } from '@hookform/resolvers/standard-schema'
import {
  AUTH_API_DETAIL_LOCALIZATIONS,
  authPasswordFieldSchema,
  formatAuthApiError,
} from '@repo/auth'
import { Button, cn } from '@repo/ui'
import { useEffect, useState, type CSSProperties } from 'react'
import { useForm } from 'react-hook-form'
import { Link, useNavigate, useSearchParams } from 'react-router'
import { z } from 'zod'

import { auth } from '~/shared/auth/client'
import { isSaasAuthEnabled } from '~/shared/config/saas-auth-enabled'
import { PasswordInput } from '~/shared/ui/password-input'

import {
  authFieldInputClassName,
  AuthFieldError,
  authGuestClientLoader,
  authPageLinks,
  AuthPageShell,
} from './auth-page-chrome'
import type { Route } from './+types/join'

import './login.css'

const joinInviteSchema = z
  .object({
    email: z.string().min(1, '请输入邮箱').email('邮箱格式不正确'),
    displayName: z.string().max(128).optional(),
    password: authPasswordFieldSchema(),
    confirmPassword: z.string().min(1, '请确认密码'),
  })
  .refine((values) => values.password === values.confirmPassword, {
    message: '两次输入的密码不一致',
    path: ['confirmPassword'],
  })

type JoinInviteFormValues = z.infer<typeof joinInviteSchema>

const ROLE_LABELS = {
  TENANT_ADMIN: '租户管理员',
  MEMBER: '成员',
  VIEWER: '只读查看者',
} as const

export function meta(_args: Route.MetaArgs) {
  return [{ title: '加入团队 · 云眼地图工作台' }]
}

export const links: Route.LinksFunction = () => authPageLinks()

export async function clientLoader() {
  return authGuestClientLoader()
}

function JoinInviteForm({
  token,
  tenantName,
  roleCode,
}: {
  token: string
  tenantName: string
  roleCode: string
}) {
  const navigate = useNavigate()
  const [submitError, setSubmitError] = useState<string | null>(null)
  const roleLabel =
    ROLE_LABELS[roleCode as keyof typeof ROLE_LABELS] ?? roleCode

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<JoinInviteFormValues>({
    resolver: standardSchemaResolver(joinInviteSchema),
    defaultValues: { email: '', displayName: '', password: '', confirmPassword: '' },
  })

  async function onSubmit(values: JoinInviteFormValues) {
    setSubmitError(null)
    try {
      await auth.joinViaInviteLink({
        token,
        email: values.email.trim(),
        password: values.password,
        displayName: values.displayName?.trim() || undefined,
      })
      void navigate('/', { replace: true })
    } catch (error) {
      setSubmitError(
        formatAuthApiError(error, { detailLocalizations: AUTH_API_DETAIL_LOCALIZATIONS }),
      )
    }
  }

  return (
    <form className="login-form-fields" onSubmit={handleSubmit(onSubmit)}>
      <p className="login-field-group rounded-lg border border-white/10 bg-white/5 px-3 py-2 text-sm text-white/70">
        即将加入 <span className="text-brand-light">{tenantName}</span>
        ，角色为 <span className="text-brand-light">{roleLabel}</span>。
      </p>

      <div className="login-field-group space-y-1.5" style={{ '--field-i': 0 } as CSSProperties}>
        <label className="text-sm font-medium text-white/70" htmlFor="join-email">
          邮箱
        </label>
        <input
          id="join-email"
          autoComplete="email"
          className={cn(authFieldInputClassName)}
          {...register('email')}
        />
        <AuthFieldError message={errors.email?.message} />
      </div>

      <div className="login-field-group space-y-1.5" style={{ '--field-i': 1 } as CSSProperties}>
        <label className="text-sm font-medium text-white/70" htmlFor="join-display">
          显示名（可选）
        </label>
        <input
          id="join-display"
          autoComplete="name"
          className={cn(authFieldInputClassName)}
          {...register('displayName')}
        />
        <AuthFieldError message={errors.displayName?.message} />
      </div>

      <div className="login-field-group space-y-1.5" style={{ '--field-i': 2 } as CSSProperties}>
        <label className="text-sm font-medium text-white/70" htmlFor="join-password">
          设置密码
        </label>
        <PasswordInput
          id="join-password"
          autoComplete="new-password"
          className={cn(authFieldInputClassName)}
          {...register('password')}
        />
        <AuthFieldError message={errors.password?.message} />
      </div>

      <div className="login-field-group space-y-1.5" style={{ '--field-i': 3 } as CSSProperties}>
        <label className="text-sm font-medium text-white/70" htmlFor="join-confirm">
          确认密码
        </label>
        <PasswordInput
          id="join-confirm"
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

      <div className="login-field-group" style={{ '--field-i': 4 } as CSSProperties}>
        <Button
          className="mt-1 h-11 w-full rounded-[10px] text-base font-medium"
          disabled={isSubmitting}
          type="submit"
        >
          {isSubmitting ? '加入中…' : '加入并进入工作台'}
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

function JoinInviteUnavailable() {
  return (
    <div className="login-form-fields space-y-4">
      <p className="text-sm leading-relaxed text-white/60">
        通过邀请链接加入需配置 <code className="text-brand-light">VITE_API_URL</code> 并启动 SaaS
        API。
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
        缺少邀请 token，请从管理员分享的完整链接打开本页。
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

function InvalidLinkNotice({ message }: { message: string }) {
  return (
    <div className="login-form-fields space-y-4">
      <p className="rounded-lg border border-red-400/30 bg-red-500/10 px-3 py-2 text-sm text-red-200/90">
        {message}
      </p>
      <p className="text-center text-sm text-white/50">
        请联系管理员获取新的邀请链接，或{' '}
        <Link className="text-brand-light hover:underline" to="/login">
          使用已有账号登录
        </Link>
        。
      </p>
    </div>
  )
}

export default function JoinInviteRoute() {
  const [searchParams] = useSearchParams()
  const token = searchParams.get('token')?.trim() ?? ''
  const saasAuthEnabled = isSaasAuthEnabled()
  const [previewError, setPreviewError] = useState<string | null>(null)
  const [preview, setPreview] = useState<{
    tenantName: string
    roleCode: string
  } | null>(null)
  const [previewLoading, setPreviewLoading] = useState(false)

  useEffect(() => {
    if (!saasAuthEnabled || !token) {
      setPreview(null)
      setPreviewError(null)
      return
    }

    let cancelled = false
    setPreviewLoading(true)
    setPreviewError(null)

    void auth
      .previewInviteLink(token)
      .then((data) => {
        if (cancelled) return
        setPreview({ tenantName: data.tenantName, roleCode: data.roleCode })
      })
      .catch((error) => {
        if (cancelled) return
        setPreview(null)
        setPreviewError(
          formatAuthApiError(error, { detailLocalizations: AUTH_API_DETAIL_LOCALIZATIONS }),
        )
      })
      .finally(() => {
        if (!cancelled) setPreviewLoading(false)
      })

    return () => {
      cancelled = true
    }
  }, [saasAuthEnabled, token])

  return (
    <AuthPageShell
      badge={saasAuthEnabled ? 'SaaS API' : '未启用'}
      brandDescription="使用管理员分享的邀请链接注册账号，立即加入团队协作空间。"
      headline="加入协作空间"
      headlineAccent="填写信息完成注册"
      subtitle="邀请链接有效期内可多次使用（若管理员设置了上限）"
      title="接受团队邀请"
    >
      {!saasAuthEnabled ? (
        <JoinInviteUnavailable />
      ) : !token ? (
        <MissingTokenNotice />
      ) : previewLoading ? (
        <p className="text-sm text-white/60">正在验证邀请链接…</p>
      ) : previewError ? (
        <InvalidLinkNotice message={previewError} />
      ) : preview ? (
        <JoinInviteForm
          token={token}
          tenantName={preview.tenantName}
          roleCode={preview.roleCode}
        />
      ) : (
        <InvalidLinkNotice message="邀请链接无效或已过期" />
      )}
    </AuthPageShell>
  )
}
