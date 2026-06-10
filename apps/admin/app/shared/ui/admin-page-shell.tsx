import { cn } from '@repo/ui'
import type { ReactNode } from 'react'

export function AdminPageHeader({
  title,
  description,
  actions,
}: {
  title: string
  description?: string
  actions?: ReactNode
}) {
  return (
    <header className="flex flex-wrap items-start justify-between gap-4">
      <div>
        <h2 className="admin-display text-2xl font-semibold tracking-tight">{title}</h2>
        {description ? <p className="mt-1 text-sm text-muted-foreground">{description}</p> : null}
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

export function AdminEmptyState({ message }: { message: string }) {
  return (
    <div className="flex flex-col items-center justify-center gap-2 px-6 py-16 text-center">
      <p className="text-sm text-muted-foreground">{message}</p>
    </div>
  )
}
