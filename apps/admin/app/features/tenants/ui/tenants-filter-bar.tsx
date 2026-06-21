import { Badge, Button, cn } from '@repo/ui'
import { XIcon } from 'lucide-react'

import { TENANT_ONBOARDING_LABELS } from '~/features/tenants/lib/tenant-lifecycle'
import type { TenantOnboardingPhase } from '~/entities/tenant/model'

const STATUS_LABELS: Record<string, string> = {
  all: '全部状态',
  active: '正常',
  suspended: '已停用',
}

export function TenantsFilterBar({
  search,
  status,
  onboarding,
  product,
  productLabel,
  onClearAll,
}: {
  search: string
  status: string
  onboarding: string
  product?: string
  productLabel?: string
  onClearAll: () => void
}) {
  const chips: { key: string; label: string }[] = []

  if (search.trim()) {
    chips.push({ key: 'search', label: `搜索「${search.trim()}」` })
  }
  if (product && product !== 'all') {
    chips.push({ key: 'product', label: productLabel ?? product })
  }
  if (status !== 'all') {
    chips.push({ key: 'status', label: STATUS_LABELS[status] ?? status })
  }
  if (onboarding !== 'all') {
    chips.push({
      key: 'onboarding',
      label: TENANT_ONBOARDING_LABELS[onboarding as TenantOnboardingPhase] ?? onboarding,
    })
  }

  if (chips.length === 0) return null

  return (
    <div className="flex flex-wrap items-center gap-2 rounded-xl border border-border/50 bg-muted/10 px-3 py-2">
      <span className="text-xs text-muted-foreground">已筛选</span>
      {chips.map((chip) => (
        <Badge key={chip.key} variant="secondary" className="font-normal">
          {chip.label}
        </Badge>
      ))}
      <Button
        type="button"
        variant="ghost"
        size="sm"
        className={cn('ml-auto h-7 gap-1 text-xs')}
        onClick={onClearAll}
      >
        <XIcon className="size-3" />
        清除全部
      </Button>
    </div>
  )
}
