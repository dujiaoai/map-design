import { Button, cn, Input, Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@repo/ui'
import { SearchIcon, XIcon } from 'lucide-react'
import type { RefObject } from 'react'

export function AdminTableToolbar({
  search,
  onSearchChange,
  searchPlaceholder = '搜索…',
  searchAriaLabel,
  searchInputRef,
  status,
  onStatusChange,
  statusOptions,
  trailing,
}: {
  search: string
  onSearchChange: (value: string) => void
  searchPlaceholder?: string
  searchAriaLabel?: string
  searchInputRef?: RefObject<HTMLInputElement | null>
  status?: string
  onStatusChange?: (value: string) => void
  statusOptions?: { value: string; label: string }[]
  trailing?: React.ReactNode
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
          ref={searchInputRef}
          type="search"
          role="searchbox"
          aria-label={resolvedSearchLabel}
          aria-keyshortcuts="/"
          className={cn('pl-9', search ? 'pr-9' : 'pr-14')}
          placeholder={searchPlaceholder}
          value={search}
          onChange={(event) => onSearchChange(event.target.value)}
        />
        {!search ? (
          <kbd className="pointer-events-none absolute top-1/2 right-2 hidden -translate-y-1/2 rounded border border-border/70 bg-muted/30 px-1.5 py-0.5 font-mono text-[10px] text-muted-foreground sm:inline">
            /
          </kbd>
        ) : null}
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
      {trailing}
    </div>
  )
}
