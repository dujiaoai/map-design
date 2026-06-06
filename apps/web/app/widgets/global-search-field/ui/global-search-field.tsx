import {
  Button,
  Input,
  Popover,
  PopoverContent,
  cn,
} from '@repo/ui'
import {
  ArrowRightIcon,
  LayersIcon,
  MapPinIcon,
  NavigationIcon,
  ScanSearchIcon,
  SparklesIcon,
} from 'lucide-react'
import { useCallback, useEffect, useMemo, useRef, useState } from 'react'

import {
  buildSearchSuggestions,
  type GlobalSearchSuggestion,
  type GlobalSearchSuggestionKind,
} from '~/features/global-search'
import { useMapWorkspaceStore } from '~/features/map-workspace'

const SUGGESTION_LISTBOX_ID = 'workspace-global-search-listbox'
const SEARCH_DEBOUNCE_MS = 200

const kindMeta: Record<
  GlobalSearchSuggestionKind,
  { label: string; icon: typeof MapPinIcon }
> = {
  place: { label: '地点', icon: MapPinIcon },
  coordinate: { label: '坐标', icon: NavigationIcon },
  feature: { label: '要素', icon: LayersIcon },
  hint: { label: '提示', icon: SparklesIcon },
}

export function GlobalSearchField({
  inputId,
  className,
}: {
  inputId: string
  className?: string
}) {
  const anchorRef = useRef<HTMLDivElement>(null)
  const globalSearchQuery = useMapWorkspaceStore((state) => state.globalSearchQuery)
  const globalSearchPopoverOpen = useMapWorkspaceStore((state) => state.globalSearchPopoverOpen)
  const setGlobalSearchQuery = useMapWorkspaceStore((state) => state.setGlobalSearchQuery)
  const setGlobalSearchPopoverOpen = useMapWorkspaceStore((state) => state.setGlobalSearchPopoverOpen)
  const openGlobalSearchDrawer = useMapWorkspaceStore((state) => state.openGlobalSearchDrawer)

  const [debouncedQuery, setDebouncedQuery] = useState(globalSearchQuery)

  useEffect(() => {
    const timer = window.setTimeout(() => {
      setDebouncedQuery(globalSearchQuery)
    }, SEARCH_DEBOUNCE_MS)

    return () => window.clearTimeout(timer)
  }, [globalSearchQuery])

  const suggestions = useMemo(
    () => buildSearchSuggestions(debouncedQuery),
    [debouncedQuery],
  )

  const hasQuery = globalSearchQuery.trim().length > 0
  const showViewAll = hasQuery

  const handleOpenChange = useCallback(
    (
      nextOpen: boolean,
      eventDetails?: {
        reason?: string
        event?: Event
        cancel?: () => void
      },
    ) => {
      if (!nextOpen && eventDetails) {
        const target = eventDetails.event?.target
        const clickedInsideSearch =
          target instanceof Node && anchorRef.current?.contains(target)

        if (clickedInsideSearch) {
          eventDetails.cancel?.()
          return
        }
      }

      setGlobalSearchPopoverOpen(nextOpen)
    },
    [setGlobalSearchPopoverOpen],
  )

  function focusSearchField() {
    setGlobalSearchPopoverOpen(true)
  }

  function closePopover() {
    setGlobalSearchPopoverOpen(false)
  }

  function openDrawerWithQuery(nextQuery = globalSearchQuery) {
    if (nextQuery.trim()) {
      setGlobalSearchQuery(nextQuery.trim())
    }
    closePopover()
    openGlobalSearchDrawer()
  }

  function handleSelectSuggestion(suggestion: GlobalSearchSuggestion) {
    if (suggestion.kind === 'hint' && !suggestion.query.trim()) {
      return
    }

    if (suggestion.kind === 'hint' && suggestion.id === 'no-match') {
      openDrawerWithQuery(suggestion.query)
      return
    }

    setGlobalSearchQuery(suggestion.query)
    closePopover()
  }

  return (
    <Popover
      open={globalSearchPopoverOpen}
      onOpenChange={handleOpenChange}
      modal={false}
    >
      <div ref={anchorRef} className={cn('relative w-full', className)}>
        <ScanSearchIcon className="pointer-events-none absolute top-1/2 left-3 size-4 -translate-y-1/2 text-primary/50" />
        <Input
          id={inputId}
          value={globalSearchQuery}
          role="combobox"
          aria-label="全局搜索"
          aria-expanded={globalSearchPopoverOpen}
          aria-controls={SUGGESTION_LISTBOX_ID}
          aria-autocomplete="list"
          placeholder="搜索地点、坐标、要素…"
          className="workspace-header-search h-9 rounded-lg border-border bg-muted/40 pr-16 pl-9 text-sm text-foreground placeholder:text-muted-foreground dark:border-white/10 dark:bg-white/5 dark:text-white/85 dark:placeholder:text-white/35"
          onChange={(event) => setGlobalSearchQuery(event.target.value)}
          onFocus={focusSearchField}
          onKeyDown={(event) => {
            if (event.key === 'Enter') {
              event.preventDefault()
              openDrawerWithQuery()
              return
            }

            if (event.key === 'Escape') {
              event.preventDefault()
              closePopover()
            }
          }}
        />
        <kbd className="pointer-events-none absolute top-1/2 right-2 hidden -translate-y-1/2 rounded border border-border bg-background/80 px-1.5 py-0.5 text-[10px] text-muted-foreground lg:inline dark:border-white/12 dark:bg-white/5 dark:text-white/40">
          /
        </kbd>
      </div>

      <PopoverContent
        anchor={anchorRef}
        align="start"
        side="bottom"
        sideOffset={6}
        initialFocus={false}
        finalFocus={false}
        className={cn(
          'cc-menu-popover cc-global-search-popover w-[min(24rem,var(--anchor-width))] gap-0 overflow-hidden p-0',
          'border-border bg-popover text-popover-foreground',
          'data-open:animate-none data-closed:animate-none',
        )}
      >
        <div className="border-border shrink-0 border-b px-3 py-2 dark:border-white/8">
          <p className="text-foreground/80 text-xs font-medium">
            {hasQuery ? '快捷结果' : '开始搜索'}
          </p>
          <p className="text-muted-foreground text-[11px]">
            {hasQuery ? 'Enter 打开右侧面板查看全部结果' : '输入关键词后将在此显示候选'}
          </p>
        </div>

        <ul
          id={SUGGESTION_LISTBOX_ID}
          role="listbox"
          aria-label="搜索候选"
          className="max-h-72 min-h-0 overflow-y-auto overscroll-contain py-1"
        >
          {suggestions.map((suggestion) => (
            <SuggestionOption
              key={suggestion.id}
              suggestion={suggestion}
              onSelect={() => handleSelectSuggestion(suggestion)}
            />
          ))}
        </ul>

        {showViewAll ? (
          <div className="border-border shrink-0 border-t p-2 dark:border-white/8">
            <Button
              type="button"
              variant="ghost"
              size="sm"
              className="text-primary h-8 w-full justify-between px-2 text-xs"
              onMouseDown={(event) => event.preventDefault()}
              onClick={() => openDrawerWithQuery()}
            >
              查看全部结果
              <ArrowRightIcon className="size-3.5" />
            </Button>
          </div>
        ) : null}
      </PopoverContent>
    </Popover>
  )
}

function SuggestionOption({
  suggestion,
  onSelect,
}: {
  suggestion: GlobalSearchSuggestion
  onSelect: () => void
}) {
  const meta = kindMeta[suggestion.kind]
  const Icon = meta.icon
  const selectable = suggestion.kind !== 'hint' || suggestion.id === 'no-match'

  return (
    <li role="presentation">
      <button
        type="button"
        role="option"
        aria-selected={false}
        disabled={!selectable}
        className={cn(
          'flex w-full items-start gap-2.5 px-3 py-2 text-left text-sm transition-colors',
          selectable
            ? 'hover:bg-accent/70 focus-visible:bg-accent/70 focus-visible:outline-none'
            : 'cursor-default opacity-90',
        )}
        onMouseDown={(event) => {
          if (!selectable) {
            return
          }
          event.preventDefault()
        }}
        onClick={() => {
          if (!selectable) {
            return
          }
          onSelect()
        }}
      >
        <span className="bg-muted/70 text-muted-foreground mt-0.5 flex size-7 shrink-0 items-center justify-center rounded-md dark:bg-white/8">
          <Icon className="size-3.5" />
        </span>
        <span className="min-w-0 flex-1">
          <span className="text-foreground flex items-center gap-2 text-[13px] leading-5">
            <span className="truncate">{suggestion.title}</span>
            <span className="text-muted-foreground shrink-0 text-[10px]">{meta.label}</span>
          </span>
          {suggestion.subtitle ? (
            <span className="text-muted-foreground block truncate text-[11px] leading-4">
              {suggestion.subtitle}
            </span>
          ) : null}
        </span>
      </button>
    </li>
  )
}
