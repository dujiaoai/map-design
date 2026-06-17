import { Button, cn } from '@repo/ui'
import type { LucideIcon } from 'lucide-react'
import type { ReactNode } from 'react'

export function AdminMetricCard({
  icon: Icon,
  label,
  value,
  hint,
  loading = false,
  error = false,
  emphasis = false,
  className,
  footer,
  onRetry,
  isRetrying = false,
}: {
  icon: LucideIcon
  label: string
  value: ReactNode
  hint?: string
  loading?: boolean
  error?: boolean
  emphasis?: boolean
  className?: string
  footer?: ReactNode
  onRetry?: () => void
  isRetrying?: boolean
}) {
  return (
    <section
      className={cn(
        'admin-metric-card group relative overflow-hidden rounded-xl border p-5 shadow-sm backdrop-blur-sm transition-colors duration-300',
        emphasis
          ? 'border-amber-500/35 bg-amber-500/8'
          : 'border-border/70 bg-card/60 hover:border-primary/25 hover:bg-card/75',
        className,
      )}
    >
      <div
        className="pointer-events-none absolute -right-6 -top-6 size-24 rounded-full bg-primary/8 opacity-0 blur-2xl transition-opacity duration-500 group-hover:opacity-100"
        aria-hidden
      />
      <div className="relative flex items-center gap-2 text-sm text-muted-foreground">
        <Icon className="size-4 text-primary" aria-hidden />
        {label}
      </div>
      <p className="admin-display relative mt-3 text-3xl font-semibold tracking-tight tabular-nums">
        {loading ? (
          <span className="inline-block h-8 w-16 animate-pulse rounded-md bg-muted/60" />
        ) : error ? (
          <span className="text-destructive">—</span>
        ) : (
          value
        )}
      </p>
      {hint && !error ? <p className="relative mt-1 text-xs text-muted-foreground">{hint}</p> : null}
      {error && onRetry ? (
        <div className="relative mt-3">
          <Button
            type="button"
            variant="ghost"
            size="sm"
            disabled={isRetrying}
            onClick={onRetry}
          >
            {isRetrying ? '重试中…' : '重试'}
          </Button>
        </div>
      ) : null}
      {!error && footer ? <div className="relative mt-3">{footer}</div> : null}
    </section>
  )
}
