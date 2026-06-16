import { Button } from '@repo/ui'

type AdminTableBulkBarProps = {
  selectedCount: number
  onClearSelection: () => void
  children?: React.ReactNode
}

export function AdminTableBulkBar({
  selectedCount,
  onClearSelection,
  children,
}: AdminTableBulkBarProps) {
  if (selectedCount === 0) return null

  return (
    <div
      className="flex flex-wrap items-center gap-3 rounded-lg border border-primary/25 bg-primary/5 px-4 py-2.5 text-sm"
      role="status"
      aria-live="polite"
    >
      <span className="font-medium">已选 {selectedCount} 项</span>
      <Button type="button" variant="ghost" size="sm" onClick={onClearSelection}>
        取消选择
      </Button>
      {children}
    </div>
  )
}
