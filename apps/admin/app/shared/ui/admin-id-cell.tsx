import { CopyButton, cn, toast } from '@repo/ui'

export function AdminIdCell({
  value,
  label,
  className,
}: {
  value: string
  label?: string
  className?: string
}) {
  const display =
    value.length > 24 ? `${value.slice(0, 8)}…${value.slice(-4)}` : value

  return (
    <span className={cn('inline-flex min-w-0 max-w-full items-center gap-0.5', className)}>
      <span className="truncate font-mono text-xs" title={value}>
        {display}
      </span>
      <CopyButton
        value={value}
        aria-label={label ? `复制${label}` : '复制'}
        onCopied={() => toast.success(label ? `${label}已复制` : '已复制到剪贴板')}
        onCopyError={() => toast.error('复制失败')}
      />
    </span>
  )
}
