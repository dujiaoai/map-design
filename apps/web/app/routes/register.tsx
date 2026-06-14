import { standardSchemaResolver } from '@hookform/resolvers/standard-schema'
import { authPasswordFieldSchema, isAuthPasswordStrengthRequired } from '@repo/auth'
import { Button, cn, Input } from '@repo/ui'
import { Building2Icon, HashIcon, LockIcon, LockKeyholeIcon, UserCircle2Icon, UserIcon } from 'lucide-react'
import { useEffect, useState, type CSSProperties } from 'react'
import { useForm } from 'react-hook-form'
import { Link, useSearchParams } from 'react-router'
import { z } from 'zod'

import { authEmailFieldSchema, authTenantIdFieldSchema } from '~/shared/auth/auth-form-schema'
import { auth } from '~/shared/auth/client'
import { formatRegisterError } from '~/shared/auth/format-register-error'
import { isSaasAuthEnabled } from '~/shared/config/saas-auth-enabled'
import { PasswordInput } from '~/shared/ui/password-input'

import {
  authBodyTextClassName,
  authErrorBannerClassName,
  authFieldInputClassName,
  AuthFieldError,
  authGuestClientLoader,
  authLabelClassName,
  authLinkClassName,
  authMonoHintClassName,
  authMutedTextClassName,
  authPageLinks,
  AuthPageShell,
  authSegmentActiveClassName,
  authSegmentGroupClassName,
  authSegmentIdleClassName,
} from './auth-page-chrome'
import type { Route } from './+types/register'

import './login.css'

type RegisterMode = 'org' | 'join'

const registerPasswordPlaceholder = isAuthPasswordStrengthRequired()
  ? '至少 8 位，含大小写字母与数字'
  : '至少 8 位'

const orgSlugFieldSchema = z
  .string()
  .trim()
  .max(64, '组织标识最多 64 个字符')
  .optional()
  .refine((value) => !value || /^[a-z0-9]+(?:-[a-z0-9]+)*$/.test(value), {
    message: '仅小写字母、数字与连字符',
  })

const registerOrgFormSchema = z
  .object({
    orgName: z.string().trim().min(1, '请输入组织名称').max(128, '组织名称最多 128 个字符'),
    slug: orgSlugFieldSchema,
    email: authEmailFieldSchema,
    password: authPasswordFieldSchema(),
    confirmPassword: z.string().min(1, '请确认密码'),
    displayName: z.string().trim().max(128, '显示名最多 128 个字符').optional(),
  })
  .refine((values) => values.password === values.confirmPassword, {
    message: '两次输入的密码不一致',
    path: ['confirmPassword'],
  })

const registerJoinFormSchema = z
  .object({
    email: authEmailFieldSchema,
    password: authPasswordFieldSchema(),
    confirmPassword: z.string().min(1, '请确认密码'),
    tenantId: authTenantIdFieldSchema,
    displayName: z.string().trim().max(128, '显示名最多 128 个字符').optional(),
  })
  .refine((values) => values.password === values.confirmPassword, {
    message: '两次输入的密码不一致',
    path: ['confirmPassword'],
  })

type RegisterOrgFormValues = z.infer<typeof registerOrgFormSchema>
type RegisterJoinFormValues = z.infer<typeof registerJoinFormSchema>

function fieldA11y(errorMessage: string | undefined, errorId: string) {
  return {
    'aria-describedby': errorMessage ? errorId : undefined,
    'aria-invalid': errorMessage ? true : undefined,
  } as const
}

function suggestsLogin(errorMessage: string): boolean {
  return errorMessage.includes('请直接登录')
}

function resolveRegisterMode(searchParams: URLSearchParams): RegisterMode {
  if (searchParams.get('mode') === 'join') return 'join'
  if (searchParams.get('tenant')?.trim()) return 'join'
  return 'org'
}

export function meta(_args: Route.MetaArgs) {
  return [{ title: '注册 · 云眼地图工作台' }]
}

export const links: Route.LinksFunction = () => authPageLinks()

export async function clientLoader() {
  return authGuestClientLoader()
}

function RegisterUnavailable() {
  return (
    <div className="login-form-fields space-y-4">
      <p className={authBodyTextClassName}>
        注册需配置 <code className="text-brand dark:text-brand-light">VITE_API_URL</code> 并启动 SaaS API。本地开发请在根目录
        `.env` 设置 <code className="text-brand dark:text-brand-light">VITE_API_URL=/v1</code>。
      </p>
      <Button className="h-11 w-full rounded-[10px]" nativeButton={false} render={<Link to="/login" />}>
        返回登录
      </Button>
    </div>
  )
}

function RegisterModeTabs({ mode }: { mode: RegisterMode }) {
  return (
    <div
      className={authSegmentGroupClassName}
      role="tablist"
      aria-label="注册方式"
    >
      <Link
        className={cn(
          'rounded-[8px] px-3 py-2 text-center text-sm font-medium transition-colors',
          mode === 'org' ? authSegmentActiveClassName : authSegmentIdleClassName,
        )}
        role="tab"
        aria-selected={mode === 'org'}
        to="/register"
      >
        创建组织
      </Link>
      <Link
        className={cn(
          'rounded-[8px] px-3 py-2 text-center text-sm font-medium transition-colors',
          mode === 'join' ? authSegmentActiveClassName : authSegmentIdleClassName,
        )}
        role="tab"
        aria-selected={mode === 'join'}
        to="/register?mode=join"
      >
        加入团队
      </Link>
    </div>
  )
}

function RegisterForm() {
  const [searchParams] = useSearchParams()
  const mode = resolveRegisterMode(searchParams)
  const tenantFromUrl = searchParams.get('tenant')?.trim()
  const [submitError, setSubmitError] = useState<string | null>(null)
  const [successMessage, setSuccessMessage] = useState<string | null>(null)
  const [submittedContext, setSubmittedContext] = useState<{ email: string; tenantId: string } | null>(
    null,
  )

  const orgForm = useForm<RegisterOrgFormValues>({
    resolver: standardSchemaResolver(registerOrgFormSchema),
    defaultValues: {
      orgName: '',
      slug: '',
      email: '',
      password: '',
      confirmPassword: '',
      displayName: '',
    },
  })

  const joinForm = useForm<RegisterJoinFormValues>({
    resolver: standardSchemaResolver(registerJoinFormSchema),
    defaultValues: {
      email: '',
      password: '',
      confirmPassword: '',
      tenantId: 'demo',
      displayName: '',
    },
  })

  useEffect(() => {
    joinForm.reset({
      email: '',
      password: '',
      confirmPassword: '',
      tenantId: tenantFromUrl || 'demo',
      displayName: '',
    })
  }, [joinForm, tenantFromUrl])

  useEffect(() => {
    setSubmitError(null)
    setSuccessMessage(null)
    setSubmittedContext(null)
  }, [mode])

  async function onSubmitOrg(values: RegisterOrgFormValues) {
    setSubmitError(null)
    setSuccessMessage(null)
    setSubmittedContext(null)

    try {
      const result = await auth.registerOrg({
        orgName: values.orgName,
        slug: values.slug?.trim() || undefined,
        email: values.email,
        password: values.password,
        displayName: values.displayName?.trim() || undefined,
      })
      setSubmittedContext({ email: values.email, tenantId: result.tenantSlug })
      setSuccessMessage(
        `组织「${result.orgName}」已创建（标识：${result.tenantSlug}）。验证邮件已发送至 ${values.email}，请查收并点击链接完成注册。`,
      )
      orgForm.reset({
        orgName: values.orgName,
        slug: result.tenantSlug,
        email: values.email,
        displayName: values.displayName ?? '',
        password: '',
        confirmPassword: '',
      })
    } catch (error) {
      setSubmitError(formatRegisterError(error))
    }
  }

  async function onSubmitJoin(values: RegisterJoinFormValues) {
    setSubmitError(null)
    setSuccessMessage(null)
    setSubmittedContext(null)

    try {
      await auth.register({
        email: values.email,
        password: values.password,
        tenantId: values.tenantId,
        displayName: values.displayName?.trim() || undefined,
      })
      setSubmittedContext({ email: values.email, tenantId: values.tenantId })
      setSuccessMessage(`验证邮件已发送至 ${values.email}，请查收并点击链接完成注册。`)
      joinForm.reset({
        email: values.email,
        tenantId: values.tenantId,
        displayName: values.displayName ?? '',
        password: '',
        confirmPassword: '',
      })
    } catch (error) {
      setSubmitError(formatRegisterError(error))
    }
  }

  const resendHref =
    submittedContext != null
      ? `/resend-verification?email=${encodeURIComponent(submittedContext.email)}&tenant=${encodeURIComponent(submittedContext.tenantId)}`
      : '/resend-verification'

  const loginHref =
    submittedContext != null
      ? `/login?tenant=${encodeURIComponent(submittedContext.tenantId)}`
      : '/login'

  if (mode === 'org') {
    const {
      register,
      handleSubmit,
      formState: { errors, isSubmitting },
    } = orgForm

    return (
      <form className="login-form-fields" onSubmit={handleSubmit(onSubmitOrg)}>
        <RegisterModeTabs mode={mode} />

        {!successMessage ? (
          <>
            <div className="login-field-group space-y-1.5" style={{ '--field-i': 0 } as CSSProperties}>
              <label className={authLabelClassName} htmlFor="register-org-name">
                组织名称
              </label>
              <div className="relative">
                <Building2Icon className="login-field-icon pointer-events-none absolute top-1/2 left-3 size-4 -translate-y-1/2 text-primary/50" />
                <Input
                  id="register-org-name"
                  autoComplete="organization"
                  className={cn(authFieldInputClassName, 'pl-9')}
                  placeholder="云眼测绘"
                  {...fieldA11y(errors.orgName?.message, 'register-org-name-error')}
                  {...register('orgName')}
                />
              </div>
              <AuthFieldError id="register-org-name-error" message={errors.orgName?.message} />
            </div>

            <div className="login-field-group space-y-1.5" style={{ '--field-i': 1 } as CSSProperties}>
              <label className={authLabelClassName} htmlFor="register-org-slug">
                组织标识（可选）
              </label>
              <div className="relative">
                <HashIcon className="login-field-icon pointer-events-none absolute top-1/2 left-3 size-4 -translate-y-1/2 text-primary/50" />
                <Input
                  id="register-org-slug"
                  autoComplete="off"
                  className={cn(authFieldInputClassName, 'pl-9')}
                  placeholder="留空则根据组织名称自动生成"
                  {...fieldA11y(errors.slug?.message, 'register-org-slug-error')}
                  {...register('slug')}
                />
              </div>
              <AuthFieldError id="register-org-slug-error" message={errors.slug?.message} />
            </div>

            <div className="login-field-group space-y-1.5" style={{ '--field-i': 2 } as CSSProperties}>
              <label className={authLabelClassName} htmlFor="register-org-email">
                管理员邮箱
              </label>
              <div className="relative">
                <UserIcon className="login-field-icon pointer-events-none absolute top-1/2 left-3 size-4 -translate-y-1/2 text-primary/50" />
                <Input
                  id="register-org-email"
                  autoComplete="email"
                  className={cn(authFieldInputClassName, 'pl-9')}
                  placeholder="owner@example.com"
                  type="email"
                  {...fieldA11y(errors.email?.message, 'register-org-email-error')}
                  {...register('email')}
                />
              </div>
              <AuthFieldError id="register-org-email-error" message={errors.email?.message} />
            </div>

            <div className="login-field-group space-y-1.5" style={{ '--field-i': 3 } as CSSProperties}>
              <label className={authLabelClassName} htmlFor="register-org-display-name">
                显示名（可选）
              </label>
              <div className="relative">
                <UserCircle2Icon className="login-field-icon pointer-events-none absolute top-1/2 left-3 size-4 -translate-y-1/2 text-primary/50" />
                <Input
                  id="register-org-display-name"
                  autoComplete="name"
                  className={cn(authFieldInputClassName, 'pl-9')}
                  placeholder="留空则使用邮箱前缀"
                  {...fieldA11y(errors.displayName?.message, 'register-org-display-name-error')}
                  {...register('displayName')}
                />
              </div>
              <AuthFieldError
                id="register-org-display-name-error"
                message={errors.displayName?.message}
              />
            </div>

            <div className="login-field-group space-y-1.5" style={{ '--field-i': 4 } as CSSProperties}>
              <label className={authLabelClassName} htmlFor="register-org-password">
                密码
              </label>
              <PasswordInput
                id="register-org-password"
                autoComplete="new-password"
                className={authFieldInputClassName}
                leadingIcon={<LockIcon className="size-4" />}
                placeholder={registerPasswordPlaceholder}
                {...fieldA11y(errors.password?.message, 'register-org-password-error')}
                {...register('password')}
              />
              <AuthFieldError id="register-org-password-error" message={errors.password?.message} />
            </div>

            <div className="login-field-group space-y-1.5" style={{ '--field-i': 5 } as CSSProperties}>
              <label className={authLabelClassName} htmlFor="register-org-confirm-password">
                确认密码
              </label>
              <PasswordInput
                id="register-org-confirm-password"
                autoComplete="new-password"
                className={authFieldInputClassName}
                leadingIcon={<LockKeyholeIcon className="size-4" />}
                placeholder="再次输入密码"
                {...fieldA11y(errors.confirmPassword?.message, 'register-org-confirm-password-error')}
                {...register('confirmPassword')}
              />
              <AuthFieldError
                id="register-org-confirm-password-error"
                message={errors.confirmPassword?.message}
              />
            </div>
          </>
        ) : null}

        {successMessage ? (
          <div className="space-y-3" role="status" aria-live="polite">
            <p className="rounded-lg border border-primary/30 bg-primary/10 px-3 py-2 text-sm text-primary-foreground/90">
              {successMessage}
            </p>
            <p className={cn('text-center', authMutedTextClassName)}>
              未收到？{' '}
              <Link className={authLinkClassName} to={resendHref}>
                重发验证邮件
              </Link>
            </p>
          </div>
        ) : null}

        {submitError ? (
          <div
            className={authErrorBannerClassName}
            role="alert"
          >
            <p>{submitError}</p>
            {suggestsLogin(submitError) ? (
              <p className="mt-2">
                <Link className={authLinkClassName} to={loginHref}>
                  去登录
                </Link>
              </p>
            ) : null}
          </div>
        ) : null}

        {!successMessage ? (
          <div className="login-field-group" style={{ '--field-i': 6 } as CSSProperties}>
            <Button
              className="mt-1 h-11 w-full rounded-[10px] text-base font-medium"
              disabled={isSubmitting}
              type="submit"
            >
              {isSubmitting ? '创建中…' : '创建组织并发送验证邮件'}
            </Button>
          </div>
        ) : null}

        <p className={cn('text-center', authMutedTextClassName)}>
          已有账号？{' '}
          <Link className={authLinkClassName} to={loginHref}>
            去登录
          </Link>
        </p>

        <p className={authMonoHintClassName}>
          创建组织 · 首个账号为 TENANT_ADMIN · 验证邮箱后登录
        </p>
      </form>
    )
  }

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = joinForm

  return (
    <form className="login-form-fields" onSubmit={handleSubmit(onSubmitJoin)}>
      <RegisterModeTabs mode={mode} />

      {!successMessage ? (
        <>
          <div className="login-field-group space-y-1.5" style={{ '--field-i': 0 } as CSSProperties}>
            <label className={authLabelClassName} htmlFor="register-email">
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
                {...fieldA11y(errors.email?.message, 'register-email-error')}
                {...register('email')}
              />
            </div>
            <AuthFieldError id="register-email-error" message={errors.email?.message} />
          </div>

          <div className="login-field-group space-y-1.5" style={{ '--field-i': 1 } as CSSProperties}>
            <label className={authLabelClassName} htmlFor="register-tenant">
              团队标识
            </label>
            <div className="relative">
              <Building2Icon className="login-field-icon pointer-events-none absolute top-1/2 left-3 size-4 -translate-y-1/2 text-primary/50" />
              <Input
                id="register-tenant"
                autoComplete="organization"
                className={cn(authFieldInputClassName, 'pl-9')}
                placeholder="demo"
                {...fieldA11y(errors.tenantId?.message, 'register-tenant-error')}
                {...register('tenantId')}
              />
            </div>
            <AuthFieldError id="register-tenant-error" message={errors.tenantId?.message} />
          </div>

          <div className="login-field-group space-y-1.5" style={{ '--field-i': 2 } as CSSProperties}>
            <label className={authLabelClassName} htmlFor="register-display-name">
              显示名（可选）
            </label>
            <div className="relative">
              <UserCircle2Icon className="login-field-icon pointer-events-none absolute top-1/2 left-3 size-4 -translate-y-1/2 text-primary/50" />
              <Input
                id="register-display-name"
                autoComplete="name"
                className={cn(authFieldInputClassName, 'pl-9')}
                placeholder="留空则使用邮箱前缀"
                {...fieldA11y(errors.displayName?.message, 'register-display-name-error')}
                {...register('displayName')}
              />
            </div>
            <AuthFieldError id="register-display-name-error" message={errors.displayName?.message} />
          </div>

          <div className="login-field-group space-y-1.5" style={{ '--field-i': 3 } as CSSProperties}>
            <label className={authLabelClassName} htmlFor="register-password">
              密码
            </label>
            <PasswordInput
              id="register-password"
              autoComplete="new-password"
              className={authFieldInputClassName}
              leadingIcon={<LockIcon className="size-4" />}
              placeholder={registerPasswordPlaceholder}
              {...fieldA11y(errors.password?.message, 'register-password-error')}
              {...register('password')}
            />
            <AuthFieldError id="register-password-error" message={errors.password?.message} />
          </div>

          <div className="login-field-group space-y-1.5" style={{ '--field-i': 4 } as CSSProperties}>
            <label className={authLabelClassName} htmlFor="register-confirm-password">
              确认密码
            </label>
            <PasswordInput
              id="register-confirm-password"
              autoComplete="new-password"
              className={authFieldInputClassName}
              leadingIcon={<LockKeyholeIcon className="size-4" />}
              placeholder="再次输入密码"
              {...fieldA11y(errors.confirmPassword?.message, 'register-confirm-password-error')}
              {...register('confirmPassword')}
            />
            <AuthFieldError id="register-confirm-password-error" message={errors.confirmPassword?.message} />
          </div>
        </>
      ) : null}

      {successMessage ? (
        <div className="space-y-3" role="status" aria-live="polite">
          <p className="rounded-lg border border-primary/30 bg-primary/10 px-3 py-2 text-sm text-primary-foreground/90">
            {successMessage}
          </p>
          <p className={cn('text-center', authMutedTextClassName)}>
            未收到？{' '}
            <Link className={authLinkClassName} to={resendHref}>
              重发验证邮件
            </Link>
          </p>
        </div>
      ) : null}

      {submitError ? (
        <div
          className={authErrorBannerClassName}
          role="alert"
        >
          <p>{submitError}</p>
          {suggestsLogin(submitError) ? (
            <p className="mt-2">
              <Link className={authLinkClassName} to={loginHref}>
                去登录
              </Link>
            </p>
          ) : null}
        </div>
      ) : null}

      {!successMessage ? (
        <div className="login-field-group" style={{ '--field-i': 5 } as CSSProperties}>
          <Button
            className="mt-1 h-11 w-full rounded-[10px] text-base font-medium"
            disabled={isSubmitting}
            type="submit"
          >
            {isSubmitting ? '发送中…' : '发送验证邮件'}
          </Button>
        </div>
      ) : null}

      <p className={cn('text-center', authMutedTextClassName)}>
        已有账号？{' '}
        <Link className={authLinkClassName} to={loginHref}>
          去登录
        </Link>
      </p>

      <p className={authMonoHintClassName}>
        加入已有团队 · 默认角色 MEMBER · 需验证邮箱后登录
      </p>
    </form>
  )
}

export default function Register() {
  const saasAuthEnabled = isSaasAuthEnabled()

  return (
    <AuthPageShell
      badge={saasAuthEnabled ? 'SaaS API' : '未启用'}
      brandDescription="创建新组织并成为管理员，或通过团队标识加入已有组织。验证邮箱后即可登录。"
      headline="创建或加入组织"
      headlineAccent="开启地图工作台之旅"
      subtitle="自助开通 · 邮箱验证"
      title="注册"
    >
      {saasAuthEnabled ? <RegisterForm /> : <RegisterUnavailable />}
    </AuthPageShell>
  )
}
