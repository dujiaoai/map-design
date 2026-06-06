import { cn } from '@repo/ui'
import type { ReactNode } from 'react'

/** movable/anchor 工具面板内容根：仅排版，不设 overflow（滚动由 MapToolPanelBody 承担） */
export function MockToolPanelRoot({
  children,
  className,
}: {
  children: ReactNode
  className?: string
}) {
  return <div className={cn('space-y-3 text-sm', className)}>{children}</div>
}
