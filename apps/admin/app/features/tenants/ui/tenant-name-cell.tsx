import { Button, cn, toast } from '@repo/ui'
import { CopyIcon } from 'lucide-react'
import { Link } from 'react-router'

import { tenantInitials } from '~/features/tenants/lib/tenant-slug'
import type { AdminTenantSummary } from '~/entities/tenant/model'

export function TenantNameCell({ tenant }: { tenant: AdminTenantSummary }) {
  const initials = tenantInitials(tenant.name)

  async function copySlug() {
    try {
      await navigator.clipboard.writeText(tenant.slug)
      toast.success('Slug 已复制')
    } catch {
      toast.error('复制失败')
    }
  }

  return (
    <div className="flex min-w-[12rem] items-center gap-3">
      <span
        className={cn(
          'admin-tenant-avatar flex size-9 shrink-0 items-center justify-center rounded-lg border text-xs font-semibold',
          tenant.status === 'suspended'
            ? 'border-border/50 bg-muted/30 text-muted-foreground'
            : 'border-primary/25 bg-primary/10 text-primary',
        )}
        aria-hidden
      >
        {initials}
      </span>
      <div className="min-w-0">
        <Link
          to={`/tenants/${tenant.id}`}
          className="block truncate text-sm font-medium text-foreground transition-colors hover:text-primary"
        >
          {tenant.name}
        </Link>
        <div className="mt-0.5 flex items-center gap-1">
          <span className="truncate font-mono text-[11px] text-muted-foreground">{tenant.slug}</span>
          <Button
            type="button"
            variant="ghost"
            size="icon-sm"
            className="size-6 shrink-0 text-muted-foreground hover:text-foreground"
            aria-label={`复制 slug ${tenant.slug}`}
            onClick={() => void copySlug()}
          >
            <CopyIcon className="size-3" />
          </Button>
        </div>
      </div>
    </div>
  )
}
