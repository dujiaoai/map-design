import { Button, cn } from '@repo/ui'
import type { LucideIcon } from 'lucide-react'
import type { ReactElement } from 'react'

type TenantRowActionProps = {
  label: string
  icon: LucideIcon
  render?: ReactElement
  onClick?: () => void
}

function TenantRowAction({ label, icon: Icon, render, onClick }: TenantRowActionProps) {
  return (
    <Button
      type="button"
      variant="ghost"
      size="icon-sm"
      className="size-8 shrink-0 text-muted-foreground hover:bg-primary/10 hover:text-primary"
      aria-label={label}
      title={label}
      nativeButton={render ? false : undefined}
      render={render}
      onClick={onClick}
    >
      <Icon className="size-4" aria-hidden />
    </Button>
  )
}

export function TenantRowActions({
  className,
  children,
}: {
  className?: string
  children: React.ReactNode
}) {
  return (
    <div
      className={cn(
        'admin-tenant-row-actions inline-flex items-center justify-end gap-0.5',
        className,
      )}
    >
      {children}
    </div>
  )
}

export { TenantRowAction }
