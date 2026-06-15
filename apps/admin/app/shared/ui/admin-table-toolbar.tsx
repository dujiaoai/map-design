import { Button, cn, Input, Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@repo/ui'
import { SearchIcon, XIcon } from 'lucide-react'

export function AdminTableToolbar({
  search,
  onSearchChange,
  searchPlaceholder = '搜索…',
  searchAriaLabel,
  status,
  onStatusChange,
  statusOptions,
}: {
  search: string
  onSearchChange: (value: string) => void
  searchPlaceholder?: string
  searchAriaLabel?: string
  status?: string
  onStatusChange?: (value: string) => void
  statusOptions?: { value: string; label: string }[]
}) {
  const resolvedSearchLabel = searchAriaLabel ?? searchPlaceholder

  return (
    <div className="flex flex-wrap items-center gap-3">
      <div className="relative max-w-xs flex-1 min-w-[200px]">
        <SearchIcon
          className="pointer-events-none absolute top-1/2 left-3 size-4 -translate-y-1/2 text-muted-foreground"
          aria-hidden
        />
        <Input
          type="search"
          role="searchbox"
          aria-label={resolvedSearchLabel}
          className={cn('pl-9', search ? 'pr-9' : undefined)}
          placeholder={searchPlaceholder}
          value={search}
          onChange={(event) => onSearchChange(event.target.value)}
        />
        {search ? (
          <Button
            type="button"
            variant="ghost"
            size="icon-sm"
            className="absolute top-1/2 right-1 size-7 -translate-y-1/2 text-muted-foreground hover:text-foreground"
            aria-label="清除搜索"
            onClick={() => onSearchChange('')}
          >
            <XIcon className="size-3.5" aria-hidden />
          </Button>
        ) : null}
      </div>
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
