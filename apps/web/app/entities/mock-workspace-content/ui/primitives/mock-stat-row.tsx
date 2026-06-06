import { cn } from '@repo/ui'

export function MockStatRow({
  label,
  value,
  mono = false,
  highlight = false,
}: {
  label: string
  value: string
  mono?: boolean
  highlight?: boolean
}) {
  return (
    <div className="flex items-baseline justify-between gap-2 text-xs">
      <span className="text-muted-foreground shrink-0">{label}</span>
      <span
        className={cn(
          'truncate text-right',
          mono && 'cc-mono tabular-nums',
          highlight ? 'text-brand-deep dark:text-brand-light font-medium' : 'text-foreground/90',
        )}
      >
        {value}
      </span>
    </div>
  )
}
