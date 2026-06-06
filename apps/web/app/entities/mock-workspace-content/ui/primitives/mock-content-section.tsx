import { cn } from '@repo/ui'
import type { ReactNode } from 'react'

export function MockContentSection({
  title,
  children,
  className,
}: {
  title?: string
  children: ReactNode
  className?: string
}) {
  return (
    <section className={cn('space-y-2', className)}>
      {title ? (
        <h3 className="text-muted-foreground text-[11px] font-medium tracking-wide uppercase">
          {title}
        </h3>
      ) : null}
      {children}
    </section>
  )
}
