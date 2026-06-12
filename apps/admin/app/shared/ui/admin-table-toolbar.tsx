import { Input, Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@repo/ui'

export function AdminTableToolbar({
  search,
  onSearchChange,
  searchPlaceholder = '搜索…',
  status,
  onStatusChange,
  statusOptions,
}: {
  search: string
  onSearchChange: (value: string) => void
  searchPlaceholder?: string
  status?: string
  onStatusChange?: (value: string) => void
  statusOptions?: { value: string; label: string }[]
}) {
  return (
    <div className="flex flex-wrap items-center gap-3">
      <Input
        className="max-w-xs"
        placeholder={searchPlaceholder}
        value={search}
        onChange={(event) => onSearchChange(event.target.value)}
      />
      {statusOptions && onStatusChange ? (
        <>
          <span className="text-sm text-muted-foreground">状态</span>
          <Select value={status ?? 'all'} onValueChange={(value) => onStatusChange(value ?? 'all')}>
            <SelectTrigger className="min-w-[140px]">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {statusOptions.map((option) => (
                <SelectItem key={option.value} value={option.value}>
                  {option.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </>
      ) : null}
    </div>
  )
}
