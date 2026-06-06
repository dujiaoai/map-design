import { cn, Input } from '@repo/ui'
import {
  ArrowDownIcon,
  ArrowUpIcon,
  CornerDownLeftIcon,
  SearchIcon,
} from 'lucide-react'
import { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import { createPortal } from 'react-dom'
import { useNavigate } from 'react-router'

import { mockNavMainItems } from '~/entities/navigation'
import { useActiveNavItemIds, useMapWorkspaceStore } from '~/features/map-workspace'
import {
  buildWorkspaceCommandRegistry,
  createWorkspaceActionExecutor,
  groupResolvedCommandItems,
  loadCommandHistory,
  rememberCommandAction,
  resolveCommandItems,
  type WorkspaceCommandItem,
} from '~/features/workspace-command'

import { WorkspaceCommandGroupIcon } from './command-group-icon'

export function WorkspaceCommandPalette() {
  const navigate = useNavigate()
  const open = useMapWorkspaceStore((state) => state.commandPaletteOpen)
  const query = useMapWorkspaceStore((state) => state.commandPaletteQuery)
  const setQuery = useMapWorkspaceStore((state) => state.setCommandPaletteQuery)
  const closeCommandPalette = useMapWorkspaceStore((state) => state.closeCommandPalette)
  const activeNavItemIds = useActiveNavItemIds()

  const inputRef = useRef<HTMLInputElement>(null)
  const listRef = useRef<HTMLDivElement>(null)
  const [selectedIndex, setSelectedIndex] = useState(0)
  const [recentKeys, setRecentKeys] = useState<string[]>(() => loadCommandHistory())

  const registry = useMemo(
    () => buildWorkspaceCommandRegistry(mockNavMainItems, activeNavItemIds),
    [activeNavItemIds],
  )

  const flatItems = useMemo(
    () =>
      resolveCommandItems({
        query,
        registry,
        recentActionKeys: recentKeys,
      }),
    [query, recentKeys, registry],
  )

  const groupedItems = useMemo(() => groupResolvedCommandItems(flatItems), [flatItems])
  const displayItems = useMemo(() => groupedItems.flatMap((section) => section.items), [groupedItems])

  const executeAction = useMemo(
    () =>
      createWorkspaceActionExecutor({
        items: mockNavMainItems,
        navigate,
        getState: () => useMapWorkspaceStore.getState(),
        clearMapTool: () => useMapWorkspaceStore.getState().clearMapTool(),
        clearPanelTools: () => useMapWorkspaceStore.getState().clearPanelTools(),
        setGlobalSearchQuery: (nextQuery) =>
          useMapWorkspaceStore.getState().setGlobalSearchQuery(nextQuery),
        openGlobalSearchDrawer: () => useMapWorkspaceStore.getState().openGlobalSearchDrawer(),
      }),
    [navigate],
  )

  const runCommand = useCallback(
    (item: WorkspaceCommandItem) => {
      executeAction(item.action)
      const nextHistory = rememberCommandAction(item.action)
      setRecentKeys(nextHistory)
      closeCommandPalette()
    },
    [closeCommandPalette, executeAction],
  )

  useEffect(() => {
    if (!open) {
      return
    }

    setSelectedIndex(0)
    const frame = window.requestAnimationFrame(() => {
      inputRef.current?.focus()
      inputRef.current?.select()
    })

    return () => window.cancelAnimationFrame(frame)
  }, [open])

  useEffect(() => {
    setSelectedIndex(0)
  }, [query])

  useEffect(() => {
    if (!open) {
      return
    }

    const selected = displayItems[selectedIndex]
    if (!selected) {
      return
    }

    const node = listRef.current?.querySelector(`[data-command-id="${selected.id}"]`)
    if (!(node instanceof HTMLElement) || !listRef.current) {
      return
    }

    scrollCommandItemIntoView(listRef.current, node)
  }, [displayItems, open, selectedIndex])

  useEffect(() => {
    if (!open) {
      return
    }

    function onKeyDown(event: KeyboardEvent) {
      if (event.key === 'ArrowDown') {
        event.preventDefault()
        setSelectedIndex((current) => Math.min(current + 1, Math.max(displayItems.length - 1, 0)))
        return
      }

      if (event.key === 'ArrowUp') {
        event.preventDefault()
        setSelectedIndex((current) => Math.max(current - 1, 0))
        return
      }

      if (event.key === 'Enter') {
        event.preventDefault()
        const item = displayItems[selectedIndex]
        if (item) {
          runCommand(item)
        }
      }
    }

    window.addEventListener('keydown', onKeyDown)
    return () => window.removeEventListener('keydown', onKeyDown)
  }, [displayItems, open, runCommand, selectedIndex])

  if (!open || typeof document === 'undefined') {
    return null
  }

  return createPortal(
    <div className="workspace-command-palette-root fixed inset-0 z-[120] overflow-hidden p-4 pt-[clamp(3.5rem,12vh,6.5rem)] pb-4">
      <button
        type="button"
        aria-label="关闭命令面板"
        className="workspace-command-palette-backdrop absolute inset-0 bg-black/20 backdrop-blur-[2px] dark:bg-black/50"
        onClick={closeCommandPalette}
      />

      <div
        role="dialog"
        aria-modal="true"
        aria-label="工作台命令面板"
        className="workspace-command-palette-panel relative z-10 mx-auto flex w-full max-w-xl flex-col"
      >
        <div className="workspace-command-palette-header border-border flex shrink-0 items-center gap-2 border-b px-3 py-2 dark:border-white/8">
          <SearchIcon className="text-primary/60 size-4 shrink-0" aria-hidden />
          <Input
            ref={inputRef}
            value={query}
            aria-label="搜索命令"
            placeholder="输入工具名、模块名或地点…"
            className="h-9 border-0 bg-transparent px-0 shadow-none focus-visible:ring-0 dark:bg-transparent"
            onChange={(event) => setQuery(event.target.value)}
          />
        </div>

        <div ref={listRef} className="workspace-command-palette-scroll min-h-0 flex-1 py-1">
          {displayItems.length === 0 ? (
            <p className="text-muted-foreground px-4 py-8 text-center text-sm">没有匹配的命令</p>
          ) : (
            groupedItems.map((section) => (
              <section key={section.group} className="pb-1">
                <p className="workspace-command-palette-section-label text-muted-foreground sticky top-0 z-[1] px-3 py-1.5 text-[10px] font-medium tracking-wide uppercase">
                  {section.label}
                </p>
                <ul>
                  {section.items.map((item) => {
                    const itemIndex = displayItems.findIndex((entry) => entry.id === item.id)
                    const selected = itemIndex === selectedIndex

                    return (
                      <li key={item.id}>
                        <button
                          type="button"
                          data-command-id={item.id}
                          className={cn(
                            'flex w-full items-center gap-2.5 px-3 py-2 text-left text-sm transition-colors',
                            selected
                              ? 'bg-accent/80 text-foreground dark:bg-white/8'
                              : 'hover:bg-accent/50 dark:hover:bg-white/5',
                          )}
                          onMouseEnter={() => setSelectedIndex(itemIndex)}
                          onClick={() => runCommand(item)}
                        >
                          <span className="bg-muted/70 flex size-7 shrink-0 items-center justify-center rounded-md dark:bg-white/8">
                            <WorkspaceCommandGroupIcon group={item.group} />
                          </span>
                          <span className="min-w-0 flex-1">
                            <span className="flex items-center gap-2">
                              <span className="truncate">{item.title}</span>
                              {item.active ? (
                                <span className="text-primary shrink-0 text-[10px]">已开启</span>
                              ) : null}
                            </span>
                            {item.subtitle ? (
                              <span className="text-muted-foreground block truncate text-[11px] leading-4">
                                {item.subtitle}
                              </span>
                            ) : null}
                          </span>
                        </button>
                      </li>
                    )
                  })}
                </ul>
              </section>
            ))
          )}
        </div>

        <div className="workspace-command-palette-footer border-border text-muted-foreground flex shrink-0 items-center gap-3 border-t px-3 py-2 text-[10px] dark:border-white/8">
          <span className="inline-flex items-center gap-1">
            <ArrowUpIcon className="size-3" />
            <ArrowDownIcon className="size-3" />
            选择
          </span>
          <span className="inline-flex items-center gap-1">
            <CornerDownLeftIcon className="size-3" />
            执行
          </span>
          <span className="ml-auto">Esc 关闭</span>
        </div>
      </div>
    </div>,
    document.body,
  )
}

function scrollCommandItemIntoView(container: HTMLElement, node: HTMLElement) {
  const containerRect = container.getBoundingClientRect()
  const nodeRect = node.getBoundingClientRect()

  if (nodeRect.top < containerRect.top) {
    container.scrollTop -= containerRect.top - nodeRect.top
    return
  }

  if (nodeRect.bottom > containerRect.bottom) {
    container.scrollTop += nodeRect.bottom - containerRect.bottom
  }
}
