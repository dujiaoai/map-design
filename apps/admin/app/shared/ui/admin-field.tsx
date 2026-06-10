import { cn } from '@repo/ui'
import type { ReactNode } from 'react'

export function AdminField({
  label,
  htmlFor,
  error,
  children,
  className,
}: {
  label: string
  htmlFor?: string
  error?: string
  children: ReactNode
  className?: string
}) {
  return (
    <div className={cn('space-y-1.5', className)}>
      <label className="text-sm text-muted-foreground" htmlFor={htmlFor}>
        {label}
      </label>
      {children}
      {error ? <p className="text-xs text-destructive">{error}</p> : null}
    </div>
  )
}

export function AdminFormError({ message }: { message: string | null }) {
  if (!message) return null
  return (
    <p className="rounded-lg border border-destructive/30 bg-destructive/10 px-3 py-2 text-sm text-destructive">
      {message}
    </p>
  )
}
