import { Badge, cn } from '@repo/ui'

const STATUS_LABELS: Record<string, string> = {
  active: '正常',
  invited: '待接受',
  unverified: '待验证',
  suspended: '已停用',
  disabled: '已禁用',
  pending: '待支付',
  paid: '已支付',
  cancelled: '已取消',
  refunded: '已退款',
  expired: '已过期',
  inactive: '已下架',
  issued: '已开具',
  rejected: '已驳回',
  credited: '已入账',
}

const STATUS_VARIANT: Record<string, 'default' | 'secondary' | 'destructive' | 'outline'> = {
  active: 'default',
  invited: 'outline',
  suspended: 'destructive',
  disabled: 'secondary',
  pending: 'outline',
  paid: 'default',
  cancelled: 'secondary',
  refunded: 'secondary',
  expired: 'destructive',
  inactive: 'secondary',
  issued: 'default',
  rejected: 'destructive',
  credited: 'default',
  unverified: 'outline',
}

export function AdminStatusBadge({
  status,
  label,
}: {
  status: string
  label?: string
}) {
  const resolvedLabel = label ?? STATUS_LABELS[status] ?? status
  const variant = STATUS_VARIANT[status] ?? 'outline'
  return (
    <Badge variant={variant} className={cn('font-mono text-[11px] uppercase tracking-wide')}>
      {resolvedLabel}
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

export function formatAdminIsoDate(iso: string | null | undefined) {
  if (!iso) return '—'
  const date = new Date(iso)
  if (Number.isNaN(date.getTime())) return '—'
  return new Intl.DateTimeFormat('zh-CN', {
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
    hour: '2-digit',
    minute: '2-digit',
  }).format(date)
}
