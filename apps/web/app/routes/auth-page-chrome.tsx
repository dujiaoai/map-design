import { cn } from '@repo/ui'
import {
  LayersIcon,
  MapIcon,
  RadarIcon,
  ShieldCheckIcon,
} from 'lucide-react'
import { useEffect, useState, type CSSProperties, type ReactNode } from 'react'
import { redirect } from 'react-router'

import { auth } from '~/shared/auth/client'
import { CommandRadar, useWorkspacePointer } from '~/widgets/workspace-shell'

export const AUTH_PAGE_BACKGROUND_URL =
  'https://airace.naqufei.com/yunyan/assets/login-background-ByixqUQK.webp'

export const authFieldInputClassName =
  'login-field-input h-11 rounded-[10px] border-white/10 bg-[var(--surface-elevated)] text-[var(--text-on-dark)] text-base shadow-[0_0_0_1px_var(--brand-muted)_inset] transition-[color,box-shadow] placeholder:text-white/35 focus-visible:border-primary focus-visible:ring-primary/30 md:text-sm'

const brandFeatures = [
  { icon: RadarIcon, label: '实时空间态势感知' },
  { icon: LayersIcon, label: 'Dock · 浮层 · 插件编排' },
  { icon: ShieldCheckIcon, label: '企业级多租户隔离' },
] as const

export function authPageLinks() {
  return [
    { rel: 'preconnect', href: 'https://airace.naqufei.com' },
    { rel: 'preload', as: 'image', href: AUTH_PAGE_BACKGROUND_URL, type: 'image/webp' },
    { rel: 'preconnect', href: 'https://fonts.googleapis.com' },
    { rel: 'preconnect', href: 'https://fonts.gstatic.com', crossOrigin: 'anonymous' as const },
    {
      rel: 'stylesheet',
      href: 'https://fonts.googleapis.com/css2?family=JetBrains+Mono:wght@400;500&family=Noto+Sans+SC:wght@400;500;600;700&family=ZCOOL+QingKe+HuangYou&display=swap',
    },
  ]
}

export async function authGuestClientLoader() {
  auth.hydrateSession()
  if (auth.isAuthenticated()) {
    throw redirect('/')
  }
  return null
}

export function AuthFieldError({ message }: { message?: string }) {
  if (!message) return null
  return <p className="text-xs text-red-300/90">{message}</p>
}

function AuthPageAtmosphere() {
  return (
    <div className="login-atmosphere" aria-hidden="true">
      <div
        className="login-hero-bg"
        style={{ backgroundImage: `url(${AUTH_PAGE_BACKGROUND_URL})` }}
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

function AuthBrandPanel({
  headline,
  headlineAccent,
  description,
}: {
  headline: string
  headlineAccent: string
  description: string
}) {
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
                {headline}
                <span className="cc-headline-gradient mt-2 block">{headlineAccent}</span>
              </h1>
              <p className="login-brand-desc max-w-[28rem] text-sm leading-relaxed text-white/55">
                {description}
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

export function AuthPageShell({
  title,
  subtitle,
  badge,
  headline,
  headlineAccent,
  brandDescription,
  children,
}: {
  title: string
  subtitle: string
  badge: string
  headline: string
  headlineAccent: string
  brandDescription: string
  children: ReactNode
}) {
  const pointer = useWorkspacePointer()

  const pointerStyle = {
    '--cc-px': pointer.x,
    '--cc-py': pointer.y,
  } as CSSProperties

  return (
    <div className="login-page login-layout relative" style={pointerStyle}>
      <AuthPageAtmosphere />
      <AuthBrandPanel
        headline={headline}
        headlineAccent={headlineAccent}
        description={brandDescription}
      />

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
                      {title}
                    </h2>
                    <span className="login-dev-badge rounded-full px-2.5 py-0.5">{badge}</span>
                  </div>
                  <p className="text-sm text-white/50">{subtitle}</p>
                </div>
              </div>
            </header>

            {children}
          </div>
        </div>
      </main>
    </div>
  )
}
