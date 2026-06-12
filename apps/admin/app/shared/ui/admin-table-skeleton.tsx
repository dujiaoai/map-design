import { Skeleton } from '@repo/ui'

export function AdminTableSkeleton({
  columns,
  rows = 6,
  showPagination = false,
}: {
  columns: number
  rows?: number
  showPagination?: boolean
}) {
  return (
    <div className="p-0">
      <div className="admin-table-wrap overflow-x-auto">
        <table className="admin-data-table w-full min-w-[640px] text-sm">
          <thead className="border-b border-border/60 bg-muted/25">
            <tr>
              {Array.from({ length: columns }).map((_, index) => (
                <th key={index} className="px-4 py-3">
                  <Skeleton className="h-3 w-16" />
                </th>
              ))}
            </tr>
          </thead>
          <tbody className="divide-y divide-border/50">
            {Array.from({ length: rows }).map((_, rowIndex) => (
              <tr key={rowIndex}>
                {Array.from({ length: columns }).map((_, colIndex) => (
                  <td key={colIndex} className="px-4 py-3">
                    <Skeleton
                      className="h-4"
                      style={{ width: `${55 + ((rowIndex + colIndex) % 4) * 10}%` }}
                    />
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      {showPagination ? (
        <div className="flex items-center justify-between gap-3 border-t border-border/60 px-5 py-4">
          <Skeleton className="h-4 w-36" />
          <div className="flex items-center gap-2">
            <Skeleton className="h-8 w-16" />
            <Skeleton className="h-4 w-12" />
            <Skeleton className="h-8 w-16" />
          </div>
        </div>
      ) : null}
    </div>
  )
}

export function AdminDetailSkeleton() {
  return (
    <div className="space-y-6">
      <Skeleton className="h-8 w-28" />
      <div className="space-y-2">
        <Skeleton className="h-8 w-64" />
        <Skeleton className="h-4 w-40" />
      </div>
      <div className="grid gap-4 sm:grid-cols-2">
        {Array.from({ length: 4 }).map((_, index) => (
          <div key={index} className="space-y-2 rounded-xl border border-border/70 p-5">
            <Skeleton className="h-3 w-20" />
            <Skeleton className="h-5 w-32" />
          </div>
        ))}
      </div>
    </div>
  )
}
