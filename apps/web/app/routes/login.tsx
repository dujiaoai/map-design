import { standardSchemaResolver } from '@hookform/resolvers/standard-schema'
import { Button, cn, Input } from '@repo/ui'
import {
  Building2Icon,
  LayersIcon,
  MapIcon,
  RadarIcon,
  ShieldCheckIcon,
  UserIcon,
} from 'lucide-react'
import { useEffect, useState, type CSSProperties } from 'react'
import { useForm } from 'react-hook-form'
import { redirect, useNavigate } from 'react-router'
import { z } from 'zod'

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
import { CommandRadar, useWorkspacePointer } from '~/widgets/workspace-shell'

import type { Route } from './+types/login'

import './login.css'

const LOGIN_BACKGROUND_URL =
  'https://airace.naqufei.com/yunyan/assets/login-background-ByixqUQK.webp'

const saasLoginFormSchema = z.object({
  email: z.string().min(1, '请输入邮箱').email('请输入有效邮箱'),
  password: z.string().min(1, '请输入密码'),
  tenantId: z.string().min(1, '请输入租户标识'),
})

const devLoginFormSchema = z.object({
  username: z.string().min(1, '请输入您的账号'),
  password: z.string().min(1, '请输入您的密码'),
})

type SaasLoginFormValues = z.infer<typeof saasLoginFormSchema>
type DevLoginFormValues = z.infer<typeof devLoginFormSchema>

const saasAuthEnabled = isSaasAuthEnabled()

const fieldInputClassName =
  'login-field-input h-11 rounded-[10px] border-white/10 bg-[var(--surface-elevated)] text-[var(--text-on-dark)] text-base shadow-[0_0_0_1px_var(--brand-muted)_inset] transition-[color,box-shadow] placeholder:text-white/35 focus-visible:border-primary focus-visible:ring-primary/30 md:text-sm'

const brandFeatures = [
  { icon: RadarIcon, label: '实时空间态势感知' },
  { icon: LayersIcon, label: 'Dock · 浮层 · 插件编排' },
  { icon: ShieldCheckIcon, label: '企业级多租户隔离' },
] as const

function resolveUserEmail(username: string): string {
  return username.includes('@') ? username : `${username}@yunyan.local`
}

function FieldError({ message }: { message?: string }) {
  if (!message) return null
  return <p className="text-xs text-red-300/90">{message}</p>
}

export function meta(_args: Route.MetaArgs) {
  return [{ title: '登录 · 云眼地图工作台' }]
}

export function links(_args: Route.LinksArgs) {
  return [
    { rel: 'preconnect', href: 'https://airace.naqufei.com' },
    { rel: 'preload', as: 'image', href: LOGIN_BACKGROUND_URL, type: 'image/webp' },
    { rel: 'preconnect', href: 'https://fonts.googleapis.com' },
    { rel: 'preconnect', href: 'https://fonts.gstatic.com', crossOrigin: 'anonymous' as const },
    {
      rel: 'stylesheet',
      href: 'https://fonts.googleapis.com/css2?family=JetBrains+Mono:wght@400;500&family=Noto+Sans+SC:wght@400;500;600;700&family=ZCOOL+QingKe+HuangYou&display=swap',
    },
  ]
}

export async function clientLoader() {
  auth.hydrateSession()
  if (auth.isAuthenticated()) {
    throw redirect('/')
  }
  return null
}

function LoginAtmosphere() {
  return (
    <div className="login-atmosphere" aria-hidden="true">
      <div
        className="login-hero-bg"
        style={{ backgroundImage: `url(${LOGIN_BACKGROUND_URL})` }}
      />
      <div className="login-hero-vignette" />
      <div className="cc-grid" />
      <div className="cc-grid-floor" />
      <div className="cc-aurora" />
      <div className="cc-scanline" />
    </div>
  )
}

function CoordReadout() {
  const [coords, setCoords] = useState({ lat: '31.2304', lng: '121.4737', alt: '004.2' })

  useEffect(() => {
    const tick = window.setInterval(() => {
      setCoords({
        lat: (31.22 + Math.random() * 0.02).toFixed(4),
        lng: (121.46 + Math.random() * 0.03).toFixed(4),
        alt: (3.8 + Math.random() * 0.8).toFixed(1).padStart(5, '0'),
      })
    }, 2400)

    return () => window.clearInterval(tick)
  }, [])

  return (
    <div className="cc-coord-readout cc-mono rounded-lg px-4 py-3 text-[11px] leading-relaxed text-white/60">
      <p className="mb-1 text-[10px] tracking-[0.14em] text-brand-light/80 uppercase">Live Fix</p>
      <p>
        LAT <span className="text-white/85">{coords.lat}</span> · LNG{' '}
        <span className="text-white/85">{coords.lng}</span>
      </p>
      <p>
        ALT <span className="text-white/85">{coords.alt}</span> m · SRID{' '}
        <span className="text-white/85">EPSG:4326</span>
      </p>
    </div>
  )
}

function BrandLogo({ compact = false }: { compact?: boolean }) {
  return (
    <div className={cn('flex items-center gap-3', compact && 'justify-center')}>
      <div
        className={cn(
          'cc-logo-mark bg-brand-gradient relative flex shrink-0 items-center justify-center rounded-xl text-primary-foreground shadow-[0_8px_28px_var(--brand-glow)]',
          compact ? 'size-10' : 'size-11',
        )}
      >
        <MapIcon className="relative z-10 size-5" />
      </div>
      <div className={cn(compact && 'text-left')}>
        <p
          className={cn(
            'cc-display font-semibold tracking-tight',
            compact ? 'text-base' : 'text-lg',
          )}
        >
          云眼地图工作台
        </p>
        {!compact ? (
          <p className="text-sm text-white/50">下一代 GIS 协同平台</p>
        ) : null}
      </div>
    </div>
  )
}

function LoginBrandPanel() {
  return (
    <aside className="login-brand-panel hidden min-h-0 lg:flex lg:flex-col">
      <div className="login-brand-inner login-stagger relative flex min-h-0 flex-1 flex-col">
        <header className="shrink-0" style={{ '--stagger': 0 } as CSSProperties}>
          <BrandLogo />
        </header>

        <div className="login-brand-main">
          <div className="login-brand-hero" style={{ '--stagger': 1 } as CSSProperties}>
            <div className="min-w-0 space-y-4">
              <div className="inline-flex items-center gap-2 rounded-full border border-primary/30 bg-primary/10 px-3 py-1 text-[11px] text-brand-soft">
                <span className="cc-live-dot" aria-hidden="true" />
                云眼 · 指挥舱
              </div>
              <h1 className="cc-display text-[clamp(1.625rem,2.2vw,2.25rem)] leading-[1.12] font-bold tracking-tight text-white/95">
                探索空间维度
                <span className="cc-headline-gradient mt-2 block">掌控每一像素</span>
              </h1>
              <p className="login-brand-desc max-w-[28rem] text-sm leading-relaxed text-white/55">
                测绘、巡检、分析与协同 —— 在统一工作台中完成。侧栏导航、地图工具链与业务 Dock
                深度耦合，为 GIS 专业团队而生。
              </p>
            </div>

            <div className="login-brand-visual pointer-events-none" aria-hidden="true">
              <CommandRadar size="lg" />
            </div>
          </div>

          <ul className="login-brand-features" style={{ '--stagger': 2 } as CSSProperties}>
            {brandFeatures.map(({ icon: Icon, label }) => (
              <li
                key={label}
                className="login-feature-item cc-glass-panel flex cursor-default items-center gap-3 rounded-xl px-4 py-3"
              >
                <span className="flex size-8 shrink-0 items-center justify-center rounded-lg bg-primary/20 text-brand-light">
                  <Icon className="size-4" />
                </span>
                <span className="text-sm text-white/75">{label}</span>
              </li>
            ))}
          </ul>

          <div className="login-brand-coord" style={{ '--stagger': 3 } as CSSProperties}>
            <CoordReadout />
          </div>
        </div>
      </div>

      <footer className="login-brand-footer cc-mono shrink-0" style={{ '--stagger': 4 } as CSSProperties}>
        © YUNYAN · GIS WORKSPACE v0.1
      </footer>
    </aside>
  )
}

function SaasLoginForm() {
  const navigate = useNavigate()
  const [rememberMe, setRememberMe] = useState(false)
  const [submitError, setSubmitError] = useState<string | null>(null)

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors, isSubmitting },
  } = useForm<SaasLoginFormValues>({
    resolver: standardSchemaResolver(saasLoginFormSchema),
    defaultValues: { email: '', password: '', tenantId: 'demo' },
  })

  useEffect(() => {
    const saved = loadRememberLogin()
    if (!saved) return

    reset({
      email: saved.username,
      password: saved.password,
      tenantId: saved.tenantId ?? 'demo',
    })
    setRememberMe(saved.rememberMe)
  }, [reset])

  async function onSubmit(values: SaasLoginFormValues) {
    setSubmitError(null)

    const email = values.email.trim()
    const tenantId = values.tenantId.trim()

    if (rememberMe) {
      saveRememberLogin(email, values.password, tenantId)
    } else {
      clearRememberLogin()
    }

    try {
      await auth.login({ email, password: values.password, tenantId })
      void navigate('/', { replace: true })
    } catch (error) {
      setSubmitError(formatLoginError(error))
    }
  }

  return (
    <form className="login-form-fields" onSubmit={handleSubmit(onSubmit)}>
      <div className="login-field-group space-y-1.5" style={{ '--field-i': 0 } as CSSProperties}>
        <label className="text-sm font-medium text-white/70" htmlFor="login-email">
          邮箱
        </label>
        <div className="relative">
          <UserIcon className="login-field-icon pointer-events-none absolute top-1/2 left-3 size-4 -translate-y-1/2 text-primary/50" />
          <Input
            id="login-email"
            autoComplete="email"
            className={cn(fieldInputClassName, 'pl-9')}
            placeholder="admin@demo.local"
            type="email"
            {...register('email')}
          />
        </div>
        <FieldError message={errors.email?.message} />
      </div>

      <div className="login-field-group space-y-1.5" style={{ '--field-i': 1 } as CSSProperties}>
        <label className="text-sm font-medium text-white/70" htmlFor="login-password">
          密码
        </label>
        <PasswordInput
          id="login-password"
          autoComplete="current-password"
          className={fieldInputClassName}
          placeholder="请输入密码"
          {...register('password')}
        />
        <FieldError message={errors.password?.message} />
      </div>

      <div className="login-field-group space-y-1.5" style={{ '--field-i': 2 } as CSSProperties}>
        <label className="text-sm font-medium text-white/70" htmlFor="login-tenant">
          租户
        </label>
        <div className="relative">
          <Building2Icon className="login-field-icon pointer-events-none absolute top-1/2 left-3 size-4 -translate-y-1/2 text-primary/50" />
          <Input
            id="login-tenant"
            autoComplete="organization"
            className={cn(fieldInputClassName, 'pl-9')}
            placeholder="demo"
            {...register('tenantId')}
          />
        </div>
        <FieldError message={errors.tenantId?.message} />
      </div>

      <div
        className="login-field-group flex items-center justify-between gap-3 pt-0.5"
        style={{ '--field-i': 3 } as CSSProperties}
      >
        <label className="flex cursor-pointer select-none items-center gap-2">
          <input
            checked={rememberMe}
            type="checkbox"
            className="size-4 cursor-pointer rounded border-white/20 accent-primary focus-visible:ring-2 focus-visible:ring-primary/30"
            onChange={(event) => setRememberMe(event.target.checked)}
          />
          <span className="text-sm text-white/55">记住密码</span>
        </label>
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
          {isSubmitting ? '登录中…' : '登录'}
        </Button>
      </div>

      <p className="cc-mono text-center text-[11px] leading-relaxed text-white/38">
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
        <label className="text-sm font-medium text-white/70" htmlFor="login-username">
          账号
        </label>
        <div className="relative">
          <UserIcon className="login-field-icon pointer-events-none absolute top-1/2 left-3 size-4 -translate-y-1/2 text-primary/50" />
          <Input
            id="login-username"
            autoComplete="username"
            className={cn(fieldInputClassName, 'pl-9')}
            placeholder="请输入账号"
            {...register('username')}
          />
        </div>
        <FieldError message={errors.username?.message} />
      </div>

      <div className="login-field-group space-y-1.5" style={{ '--field-i': 1 } as CSSProperties}>
        <label className="text-sm font-medium text-white/70" htmlFor="login-dev-password">
          密码
        </label>
        <PasswordInput
          id="login-dev-password"
          autoComplete="current-password"
          className={fieldInputClassName}
          placeholder="请输入密码"
          {...register('password')}
        />
        <FieldError message={errors.password?.message} />
      </div>

      <div
        className="login-field-group flex items-center justify-between gap-3 pt-0.5"
        style={{ '--field-i': 2 } as CSSProperties}
      >
        <label className="flex cursor-pointer select-none items-center gap-2">
          <input
            checked={rememberMe}
            type="checkbox"
            className="size-4 cursor-pointer rounded border-white/20 accent-primary focus-visible:ring-2 focus-visible:ring-primary/30"
            onChange={(event) => setRememberMe(event.target.checked)}
          />
          <span className="text-sm text-white/55">记住密码</span>
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

      <p className="cc-mono text-center text-[11px] leading-relaxed text-white/38">
        MOCK · 任意账号 / 密码均可登录（未配置 VITE_API_URL）
      </p>
    </form>
  )
}

export default function Login() {
  const pointer = useWorkspacePointer()

  const pointerStyle = {
    '--cc-px': pointer.x,
    '--cc-py': pointer.y,
  } as CSSProperties

  return (
    <div className="login-page login-layout relative" style={pointerStyle}>
      <LoginAtmosphere />
      <LoginBrandPanel />

      <main className="login-form-panel flex min-h-0 min-w-0 flex-1 flex-col">
        <div className="login-form-panel-inner">
          <div
            className="login-mobile-brand login-stagger lg:hidden"
            style={{ '--stagger': 0 } as CSSProperties}
          >
            <BrandLogo compact />
          </div>

          <div className="login-form-card cc-glass-panel">
            <header className="login-form-header">
              <div className="flex items-start gap-3">
                <div className="bg-brand-gradient flex size-11 shrink-0 items-center justify-center rounded-[10px] text-primary-foreground shadow-[0_6px_20px_var(--brand-glow)]">
                  <MapIcon className="size-5" />
                </div>
                <div className="min-w-0 flex-1 space-y-1">
                  <div className="flex flex-wrap items-center gap-2">
                    <h2 className="cc-display text-xl font-semibold tracking-tight text-white/95 sm:text-2xl">
                      欢迎登录
                    </h2>
                    <span className="login-dev-badge rounded-full px-2.5 py-0.5">
                      {saasAuthEnabled ? 'SaaS API' : '开发模式'}
                    </span>
                  </div>
                  <p className="text-sm text-white/50">验证身份后进入地图工作台</p>
                </div>
              </div>
            </header>

            {saasAuthEnabled ? <SaasLoginForm /> : <DevLoginForm />}
          </div>
        </div>
      </main>
    </div>
  )
}
