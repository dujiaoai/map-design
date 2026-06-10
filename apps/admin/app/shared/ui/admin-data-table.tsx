import { cn } from '@repo/ui'
import type { ReactNode } from 'react'

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
