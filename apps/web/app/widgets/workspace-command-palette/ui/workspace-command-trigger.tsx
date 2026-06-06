import { cn } from '@repo/ui'
import { SearchIcon } from 'lucide-react'

import { WORKSPACE_GLOBAL_SEARCH_INPUT_ID } from '~/features/map-workspace'

export function WorkspaceCommandTrigger({
  className,
  onOpen,
}: {
  className?: string
  onOpen: () => void
}) {
  return (
    <button
      type="button"
      id={WORKSPACE_GLOBAL_SEARCH_INPUT_ID}
      aria-label="打开命令面板"
      aria-haspopup="dialog"
      onClick={onOpen}
      className={cn(
        'workspace-header-search flex h-9 w-full items-center gap-2 rounded-lg border border-border bg-muted/40 px-3 text-left text-sm transition-colors',
        'text-muted-foreground hover:bg-muted/60 hover:text-foreground',
        'dark:border-white/10 dark:bg-white/5 dark:hover:bg-white/8 dark:hover:text-white/85',
        className,
      )}
    >
      <SearchIcon className="size-4 shrink-0 text-primary/50" aria-hidden />
      <span className="min-w-0 flex-1 truncate">搜索命令、工具、地点…</span>
      <kbd className="hidden shrink-0 rounded border border-border bg-background/80 px-1.5 py-0.5 text-[10px] lg:inline dark:border-white/12 dark:bg-white/5 dark:text-white/40">
        ⌘K
      </kbd>
    </button>
  )
}
