import { Button, cn } from '@repo/ui'
import { AlertCircleIcon } from 'lucide-react'
import type { LucideIcon } from 'lucide-react'
import type { ReactNode } from 'react'

export function AdminPageEyebrow({ children }: { children: ReactNode }) {
  return (
    <p className="admin-display text-xs tracking-[0.24em] text-primary/75 uppercase">
      {children}
    </p>
  )
}

export function AdminPageHeader({
  eyebrow,
  title,
  description,
  actions,
}: {
  eyebrow?: string
  title: string
  description?: ReactNode
  actions?: ReactNode
}) {
  return (
    <header className="flex flex-wrap items-start justify-between gap-4">
      <div className="space-y-2">
        {eyebrow ? <AdminPageEyebrow>{eyebrow}</AdminPageEyebrow> : null}
        <div>
          <h2 className="admin-display text-2xl font-semibold tracking-tight md:text-3xl">
            {title}
          </h2>
          {description ? (
            <p className="mt-1 max-w-2xl text-sm text-muted-foreground">{description}</p>
          ) : null}
        </div>
      </div>
      {actions ? <div className="flex flex-wrap items-center gap-2">{actions}</div> : null}
    </header>
  )
}

export function AdminPanel({
  className,
  children,
}: {
  className?: string
  children: ReactNode
}) {
  return (
    <section
      className={cn(
        'overflow-hidden rounded-xl border border-border/70 bg-card/45 shadow-sm backdrop-blur-sm',
        className,
      )}
    >
      {children}
    </section>
  )
}

export function AdminPanelHeader({
  icon: Icon,
  title,
  description,
  actions,
}: {
  icon?: LucideIcon
  title: string
  description?: string
  actions?: ReactNode
}) {
  return (
    <header className="flex flex-wrap items-start justify-between gap-3 border-b border-border/50 px-4 py-3.5 md:px-5">
      <div className="min-w-0">
        <div className="flex items-center gap-2">
          {Icon ? <Icon className="size-4 shrink-0 text-primary" aria-hidden /> : null}
          <h3 className="text-sm font-semibold">{title}</h3>
        </div>
        {description ? (
          <p className="mt-0.5 text-xs text-muted-foreground">{description}</p>
        ) : null}
      </div>
      {actions ? <div className="flex shrink-0 items-center gap-2">{actions}</div> : null}
    </header>
  )
}

export function AdminConfigRow({
  label,
  value,
  mono = false,
}: {
  label: string
  value: ReactNode
  mono?: boolean
}) {
  return (
    <div className="flex flex-wrap items-center justify-between gap-2 border-b border-border/50 px-4 py-3 last:border-b-0 md:px-5">
      <span className="text-sm text-muted-foreground">{label}</span>
      <span
        className={cn(
          'text-sm font-medium',
          mono && 'font-mono text-xs text-foreground/90',
        )}
      >
        {value}
      </span>
    </div>
  )
}

export function AdminEmptyState({
  message,
  icon: Icon,
  action,
  onRetry,
  retryLabel = '重试',
  isRetrying = false,
}: {
  message: string
  icon?: LucideIcon
  action?: ReactNode
  onRetry?: () => void
  retryLabel?: string
  isRetrying?: boolean
}) {
  const DisplayIcon = Icon ?? (onRetry ? AlertCircleIcon : undefined)

  return (
    <div className="flex flex-col items-center justify-center gap-3 px-6 py-16 text-center">
      {DisplayIcon ? (
        <div className="flex size-12 items-center justify-center rounded-full border border-border/60 bg-muted/20">
          <DisplayIcon className="size-5 text-muted-foreground" aria-hidden />
        </div>
      ) : null}
      <p className="max-w-sm text-sm text-muted-foreground">{message}</p>
      {onRetry || action ? (
        <div className="flex flex-wrap items-center justify-center gap-2 pt-1">
          {onRetry ? (
            <Button
              type="button"
              variant="outline"
              size="sm"
              disabled={isRetrying}
              onClick={onRetry}
            >
              {isRetrying ? '重试中…' : retryLabel}
            </Button>
          ) : null}
          {action}
        </div>
      ) : null}
    </div>
  )
}
