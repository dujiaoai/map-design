import { cn } from '@repo/ui'
import type { LucideIcon } from 'lucide-react'
import type { ReactNode } from 'react'

export function MockEmptyState({
  icon: Icon,
  title,
  description,
  action,
  className,
}: {
  icon: LucideIcon
  title: string
  description?: string
  action?: ReactNode
  className?: string
}) {
  return (
    <div
      className={cn(
        'flex flex-col items-center justify-center gap-2 rounded-lg border border-dashed border-border px-4 py-8 text-center dark:border-white/15',
        className,
      )}
    >
      <div className="bg-muted/50 flex size-10 items-center justify-center rounded-full dark:bg-white/5">
        <Icon className="text-muted-foreground size-5" aria-hidden />
      </div>
      <p className="text-foreground text-sm font-medium">{title}</p>
      {description ? <p className="text-muted-foreground max-w-xs text-xs">{description}</p> : null}
      {action}
    </div>
  )
}
