import { standardSchemaResolver } from '@hookform/resolvers/standard-schema'
import {
  AUTH_API_DETAIL_LOCALIZATIONS,
  authPasswordFieldSchema,
  formatAuthApiError,
  isAuthPasswordStrengthRequired,
} from '@repo/auth'
import { Button, cn, Input } from '@repo/ui'
import { LockIcon, LockKeyholeIcon, UserCircle2Icon, UserIcon } from 'lucide-react'
import { useEffect, useState, type CSSProperties } from 'react'
import { useForm } from 'react-hook-form'
import { Link, useNavigate, useSearchParams } from 'react-router'
import { z } from 'zod'

import { authEmailFieldSchema } from '~/shared/auth/auth-form-schema'
import { auth } from '~/shared/auth/client'
import {
  buildInviteLinkSubtitle,
  formatJoinError,
  loginHrefForTenant,
  suggestsLoginAfterJoinError,
} from '~/shared/auth/format-join-error'
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

const joinPasswordPlaceholder = isAuthPasswordStrengthRequired()
  ? '至少 8 位，含大小写字母与数字'
  : '至少 8 位'

const joinInviteSchema = z
  .object({
    email: authEmailFieldSchema,
    displayName: z.string().trim().max(128, '显示名最多 128 个字符').optional(),
    password: authPasswordFieldSchema(),
    confirmPassword: z.string().min(1, '请确认密码'),
  })
  .refine((values) => values.password === values.confirmPassword, {
    message: '两次输入的密码不一致',
    path: ['confirmPassword'],
  })

type JoinInviteFormValues = z.infer<typeof joinInviteSchema>

type InviteLinkPreview = {
  tenantName: string
  tenantSlug: string
  roleCode: string
  expiresAt: number | null
  remainingUses: number | null
}

const ROLE_LABELS = {
  TENANT_ADMIN: '租户管理员',
  MEMBER: '成员',
  VIEWER: '只读查看者',
} as const

function fieldA11y(errorMessage: string | undefined, errorId: string) {
  return {
    'aria-describedby': errorMessage ? errorId : undefined,
    'aria-invalid': errorMessage ? true : undefined,
  } as const
}

export function meta(_args: Route.MetaArgs) {
  return [{ title: '加入团队 · 云眼地图工作台' }]
}

export const links: Route.LinksFunction = () => authPageLinks()

export async function clientLoader() {
  return authGuestClientLoader()
}

function JoinInviteSummary({ preview }: { preview: InviteLinkPreview }) {
  const roleLabel = ROLE_LABELS[preview.roleCode as keyof typeof ROLE_LABELS] ?? preview.roleCode
  return (
    <div className="login-field-group space-y-1 rounded-lg border border-white/10 bg-white/5 px-3 py-2 text-sm text-white/70">
      <p>
        即将加入 <span className="text-brand-light">{preview.tenantName}</span>
        {preview.tenantSlug ? (
          <>
            {' '}
            (<span className="font-mono text-xs text-white/50">{preview.tenantSlug}</span>)
          </>
        ) : null}
        ，角色为 <span className="text-brand-light">{roleLabel}</span>。
      </p>
      <p className="text-xs text-white/45">
        {buildInviteLinkSubtitle(preview.expiresAt, preview.remainingUses)}
      </p>
    </div>
  )
}

function JoinInviteForm({
  token,
  preview,
}: {
  token: string
  preview: InviteLinkPreview
}) {
  const navigate = useNavigate()
  const [submitError, setSubmitError] = useState<string | null>(null)
  const loginHref = loginHrefForTenant(preview.tenantSlug)

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
        email: values.email,
        password: values.password,
        displayName: values.displayName?.trim() || undefined,
      })
      void navigate('/', { replace: true })
    } catch (error) {
      setSubmitError(formatJoinError(error))
    }
  }

  return (
    <form className="login-form-fields" onSubmit={handleSubmit(onSubmit)}>
      <JoinInviteSummary preview={preview} />

      <div className="login-field-group space-y-1.5" style={{ '--field-i': 0 } as CSSProperties}>
        <label className="text-sm font-medium text-white/70" htmlFor="join-email">
          邮箱
        </label>
        <div className="relative">
          <UserIcon className="login-field-icon pointer-events-none absolute top-1/2 left-3 size-4 -translate-y-1/2 text-primary/50" />
          <Input
            id="join-email"
            autoComplete="email"
            className={cn(authFieldInputClassName, 'pl-9')}
            placeholder="you@example.com"
            type="email"
            {...fieldA11y(errors.email?.message, 'join-email-error')}
            {...register('email')}
          />
        </div>
        <AuthFieldError id="join-email-error" message={errors.email?.message} />
      </div>

      <div className="login-field-group space-y-1.5" style={{ '--field-i': 1 } as CSSProperties}>
        <label className="text-sm font-medium text-white/70" htmlFor="join-display">
          显示名（可选）
        </label>
        <div className="relative">
          <UserCircle2Icon className="login-field-icon pointer-events-none absolute top-1/2 left-3 size-4 -translate-y-1/2 text-primary/50" />
          <Input
            id="join-display"
            autoComplete="name"
            className={cn(authFieldInputClassName, 'pl-9')}
            placeholder="留空则使用邮箱前缀"
            {...fieldA11y(errors.displayName?.message, 'join-display-error')}
            {...register('displayName')}
          />
        </div>
        <AuthFieldError id="join-display-error" message={errors.displayName?.message} />
      </div>

      <div className="login-field-group space-y-1.5" style={{ '--field-i': 2 } as CSSProperties}>
        <label className="text-sm font-medium text-white/70" htmlFor="join-password">
          设置密码
        </label>
        <PasswordInput
          id="join-password"
          autoComplete="new-password"
          className={authFieldInputClassName}
          leadingIcon={<LockIcon className="size-4" />}
          placeholder={joinPasswordPlaceholder}
          {...fieldA11y(errors.password?.message, 'join-password-error')}
          {...register('password')}
        />
        <AuthFieldError id="join-password-error" message={errors.password?.message} />
      </div>

      <div className="login-field-group space-y-1.5" style={{ '--field-i': 3 } as CSSProperties}>
        <label className="text-sm font-medium text-white/70" htmlFor="join-confirm">
          确认密码
        </label>
        <PasswordInput
          id="join-confirm"
          autoComplete="new-password"
          className={authFieldInputClassName}
          leadingIcon={<LockKeyholeIcon className="size-4" />}
          placeholder="再次输入密码"
          {...fieldA11y(errors.confirmPassword?.message, 'join-confirm-error')}
          {...register('confirmPassword')}
        />
        <AuthFieldError id="join-confirm-error" message={errors.confirmPassword?.message} />
      </div>

      {submitError ? (
        <div className="space-y-2">
          <p className="rounded-lg border border-red-400/30 bg-red-500/10 px-3 py-2 text-sm text-red-200/90">
            {submitError}
          </p>
          {suggestsLoginAfterJoinError(submitError) ? (
            <p className="text-center text-sm text-white/50">
              <Link className="text-brand-light hover:underline" to={loginHref}>
                使用该租户账号登录
              </Link>
            </p>
          ) : null}
        </div>
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
        <Link className="text-brand-light hover:underline" to={loginHref}>
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
  const shouldPreview = saasAuthEnabled && Boolean(token)
  const [previewError, setPreviewError] = useState<string | null>(null)
  const [preview, setPreview] = useState<InviteLinkPreview | null>(null)
  const [previewLoading, setPreviewLoading] = useState(shouldPreview)

  useEffect(() => {
    if (!shouldPreview) {
      setPreview(null)
      setPreviewError(null)
      setPreviewLoading(false)
      return
    }

    let cancelled = false
    setPreviewLoading(true)
    setPreviewError(null)
    setPreview(null)

    void auth
      .previewInviteLink(token)
      .then((data) => {
        if (cancelled) return
        setPreview({
          tenantName: data.tenantName,
          tenantSlug: data.tenantSlug,
          roleCode: data.roleCode,
          expiresAt: data.expiresAt,
          remainingUses: data.remainingUses,
        })
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
  }, [shouldPreview, token])

  const shellSubtitle = preview
    ? buildInviteLinkSubtitle(preview.expiresAt, preview.remainingUses)
    : '请从管理员分享的完整链接打开本页'

  return (
    <AuthPageShell
      badge={saasAuthEnabled ? 'SaaS API' : '未启用'}
      brandDescription="使用管理员分享的邀请链接注册账号，立即加入团队协作空间。"
      headline="加入协作空间"
      headlineAccent="填写信息完成注册"
      subtitle={shellSubtitle}
      title="加入团队"
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
        <JoinInviteForm token={token} preview={preview} />
      ) : null}
    </AuthPageShell>
  )
}
