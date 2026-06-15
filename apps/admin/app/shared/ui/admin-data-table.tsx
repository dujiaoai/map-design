import { Button, cn } from '@repo/ui'
import { ArrowDownIcon, ArrowUpIcon, ChevronsUpDownIcon } from 'lucide-react'
import type { ReactNode } from 'react'

import type { AdminSortDirection } from '~/shared/hooks/use-admin-table-sort'

export function AdminDataTable({ children }: { children: ReactNode }) {
  return (
    <div className="admin-table-wrap overflow-x-auto">
      <table className="admin-data-table w-full min-w-[640px] text-sm">{children}</table>
    </div>
  )
}

export function AdminTableHead({ children }: { children: ReactNode }) {
  return (
    <thead className="border-b border-border/60 bg-muted/25 text-left text-xs text-muted-foreground uppercase tracking-[0.12em]">
      {children}
    </thead>
  )
}

export function AdminTableBody({ children }: { children: ReactNode }) {
  return <tbody className="divide-y divide-border/50">{children}</tbody>
}

export function AdminTableRow({
  children,
  className,
}: {
  children: ReactNode
  className?: string
}) {
  return (
    <tr className={cn('transition-colors hover:bg-muted/20', className)}>{children}</tr>
  )
}

export function AdminTableCell({
  children,
  className,
  mono,
}: {
  children: ReactNode
  className?: string
  mono?: boolean
}) {
  return (
    <td className={cn('px-4 py-3 align-middle', mono && 'font-mono text-xs', className)}>
      {children}
    </td>
  )
}

export function AdminTableHeaderCell({
  children,
  className,
}: {
  children: ReactNode
  className?: string
}) {
  return <th className={cn('px-4 py-3 font-medium', className)}>{children}</th>
}

export function AdminTableSortHeaderCell({
  label,
  active,
  direction,
  onSort,
  className,
}: {
  label: string
  active: boolean
  direction?: AdminSortDirection
  onSort: () => void
  className?: string
}) {
  return (
    <th className={cn('px-4 py-3 font-medium', className)}>
      <Button
        type="button"
        variant="ghost"
        size="sm"
        className="-ml-2 h-7 gap-1 px-2 text-xs tracking-[0.12em] text-muted-foreground uppercase hover:text-foreground"
        onClick={onSort}
      >
        {label}
        {active && direction === 'asc' ? (
          <ArrowUpIcon className="size-3" aria-hidden />
        ) : active && direction === 'desc' ? (
          <ArrowDownIcon className="size-3" aria-hidden />
        ) : (
          <ChevronsUpDownIcon className="size-3 opacity-45" aria-hidden />
        )}
      </Button>
    </th>
  )
}
