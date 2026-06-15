import { cn } from '@repo/ui'
import type { ReactNode } from 'react'

export type AdminStatusLevel = 'ok' | 'warn' | 'off' | 'info'

const LEVEL_STYLES: Record<
  AdminStatusLevel,
  { dot: string; surface: string; text: string }
> = {
  ok: {
    dot: 'bg-emerald-400 shadow-[0_0_8px_color-mix(in_oklab,var(--color-emerald-400)_60%,transparent)]',
    surface: 'border-emerald-500/25 bg-emerald-500/10',
    text: 'text-emerald-300/90',
  },
  warn: {
    dot: 'bg-amber-400 shadow-[0_0_8px_color-mix(in_oklab,var(--color-amber-400)_55%,transparent)]',
    surface: 'border-amber-500/30 bg-amber-500/10',
    text: 'text-amber-200/90',
  },
  off: {
    dot: 'bg-muted-foreground/40',
    surface: 'border-border/60 bg-muted/20',
    text: 'text-muted-foreground',
  },
  info: {
    dot: 'bg-primary/80 shadow-[0_0_8px_color-mix(in_oklab,var(--primary)_45%,transparent)]',
    surface: 'border-primary/25 bg-primary/8',
    text: 'text-primary/90',
  },
}

export function AdminStatusPill({
  level,
  label,
  className,
}: {
  level: AdminStatusLevel
  label: ReactNode
  className?: string
}) {
  const styles = LEVEL_STYLES[level]
  return (
    <span
      className={cn(
        'inline-flex items-center gap-2 rounded-full border px-2.5 py-1 text-xs font-medium',
        styles.surface,
        styles.text,
        className,
      )}
    >
      <span className={cn('size-1.5 shrink-0 rounded-full', styles.dot)} aria-hidden />
      {label}
    </span>
  )
}

export function AdminFlagBadge({
  enabled,
  label,
  warnWhenOff = false,
}: {
  enabled: boolean
  label?: string
  /** 关闭时显示 warn 色而非 off */
  warnWhenOff?: boolean
}) {
  const level: AdminStatusLevel = enabled ? 'ok' : warnWhenOff ? 'warn' : 'off'
  return (
    <AdminStatusPill
      level={level}
      label={label ?? (enabled ? '已启用' : '已关闭')}
    />
  )
}
