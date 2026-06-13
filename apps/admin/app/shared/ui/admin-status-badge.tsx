import { Badge, cn } from '@repo/ui'

const STATUS_LABELS: Record<string, string> = {
  active: '正常',
  invited: '待接受',
  unverified: '待验证',
  suspended: '已停用',
  disabled: '已禁用',
}

const STATUS_VARIANT: Record<string, 'default' | 'secondary' | 'destructive' | 'outline'> = {
  active: 'default',
  invited: 'outline',
  suspended: 'destructive',
  disabled: 'secondary',
}

export function AdminStatusBadge({ status }: { status: string }) {
  const label = STATUS_LABELS[status] ?? status
  const variant = STATUS_VARIANT[status] ?? 'outline'
  return (
    <Badge variant={variant} className={cn('font-mono text-[11px] uppercase tracking-wide')}>
      {label}
    </Badge>
  )
}

export function formatAdminDate(epochMs: number) {
  if (!epochMs) return '—'
  return new Intl.DateTimeFormat('zh-CN', {
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
    hour: '2-digit',
    minute: '2-digit',
  }).format(new Date(epochMs))
}
