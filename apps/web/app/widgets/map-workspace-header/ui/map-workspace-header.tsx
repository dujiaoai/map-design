import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
  Button,
  Input,
  Separator,
  SidebarTrigger,
  cn,
  type NavUserData,
} from '@repo/ui'
import { MapIcon, MapPinnedIcon, ScanSearchIcon } from 'lucide-react'
import { useMemo } from 'react'
import { useNavigate } from 'react-router'

import { mockNavMainItems } from '~/entities/navigation'
import {
  createNavSelectHandler,
  resolveWorkspaceContext,
  useMapWorkspaceStore,
} from '~/features/map-workspace'
import { WORKSPACE_CHROME_ICON_BUTTON_CLASS } from '~/shared/lib/workspace-chrome-styles'
import { WorkspaceHeaderActions } from '~/widgets/workspace-chrome'

export function MapWorkspaceHeader({
  className,
  user,
  notificationUnreadCount,
  onNotificationsClick,
  onAccountClick,
  onLogout,
}: {
  className?: string
  user: NavUserData | null
  notificationUnreadCount?: number
  onNotificationsClick?: () => void
  onAccountClick?: () => void
  onLogout?: () => void
}) {
  const navigate = useNavigate()
  const contextLabel = useMapWorkspaceStore((state) => resolveWorkspaceContext(state).contextLabel)
  const togglePanelTool = useMapWorkspaceStore((state) => state.togglePanelTool)
  const toggleMapTool = useMapWorkspaceStore((state) => state.toggleMapTool)
  const toggleMapModule = useMapWorkspaceStore((state) => state.toggleMapModule)
  const toggleMapDockModule = useMapWorkspaceStore((state) => state.toggleMapDockModule)
  const activeDrawerTool = useMapWorkspaceStore((state) => state.activeDrawerTool)

  const handleNavSelect = useMemo(
    () =>
      createNavSelectHandler({
        items: mockNavMainItems,
        navigate,
        togglePanelTool,
        toggleMapTool,
        toggleMapModule,
        toggleMapDockModule,
      }),
    [navigate, toggleMapDockModule, toggleMapModule, toggleMapTool, togglePanelTool],
  )

  function openGlobalSearch() {
    if (activeDrawerTool?.navItemId !== 'tool-global-search') {
      handleNavSelect('tool-global-search')
    }
  }

  return (
    <header
      className={cn(
        'workspace-header cc-glass-bar flex h-12 shrink-0 items-center gap-2 px-2 sm:px-3',
        className,
      )}
    >
      <SidebarTrigger className="size-8 shrink-0" />
      <Separator orientation="vertical" className="mx-0.5 h-5 bg-border dark:bg-white/10" />

      <div className="workspace-header-brand flex min-w-0 items-center gap-4 sm:gap-5 lg:max-w-[240px]">
        <div className="workspace-header-logo cc-logo-mark flex size-8 shrink-0 items-center justify-center rounded-lg bg-gradient-to-br from-primary to-brand-deep text-primary-foreground shadow-[0_4px_16px_rgba(48,148,255,0.4)]">
          <MapIcon className="relative z-10 size-4" />
        </div>

        <Breadcrumb className="min-w-0">
          <BreadcrumbList className="flex-nowrap items-center gap-1.5 text-xs leading-none text-muted-foreground sm:gap-2 dark:text-white/50">
            <BreadcrumbItem className="inline-flex items-center">
              <span className="cc-display leading-none text-foreground/80 dark:text-white/70">云瞰</span>
            </BreadcrumbItem>
            <BreadcrumbSeparator className="[&>svg]:size-3" />
            <BreadcrumbItem className="inline-flex min-w-0 items-center">
              <BreadcrumbPage className="truncate leading-none text-foreground dark:text-white/85">
                地图工作台
              </BreadcrumbPage>
            </BreadcrumbItem>
            {contextLabel ? (
              <>
                <BreadcrumbSeparator className="hidden sm:inline-flex [&>svg]:size-3" />
                <BreadcrumbItem className="hidden min-w-0 sm:inline-flex">
                  <BreadcrumbPage className="workspace-breadcrumb-active cc-display truncate leading-none">
                    {contextLabel}
                  </BreadcrumbPage>
                </BreadcrumbItem>
              </>
            ) : null}
          </BreadcrumbList>
        </Breadcrumb>
      </div>

      <div className="mx-1 hidden min-w-0 flex-1 md:block lg:max-w-md xl:max-w-lg">
        <div className="relative">
          <ScanSearchIcon className="pointer-events-none absolute top-1/2 left-3 size-4 -translate-y-1/2 text-primary/50" />
          <Input
            readOnly
            aria-label="全局搜索"
            placeholder="搜索地点、坐标、要素…"
            className="workspace-header-search h-9 cursor-pointer rounded-lg border-border bg-muted/40 pr-3 pl-9 text-sm text-foreground placeholder:text-muted-foreground dark:border-white/10 dark:bg-white/5 dark:text-white/85 dark:placeholder:text-white/35"
            onFocus={openGlobalSearch}
            onClick={openGlobalSearch}
          />
        </div>
      </div>

      <div className="ml-auto flex shrink-0 items-center gap-1 sm:gap-2">
        <Button
          type="button"
          variant="ghost"
          size="icon-sm"
          className={cn(WORKSPACE_CHROME_ICON_BUTTON_CLASS, 'md:hidden')}
          aria-label="搜索"
          onClick={openGlobalSearch}
        >
          <ScanSearchIcon className="size-4" />
        </Button>

        <div className="text-muted-foreground hidden items-center gap-1.5 rounded-md border border-border bg-muted/40 px-2.5 py-1.5 text-xs leading-none lg:flex dark:text-white/55 dark:border-white/10 dark:bg-white/5">
          <MapPinnedIcon className="size-3.5 shrink-0 text-brand-light/80" aria-hidden />
          <span className="max-w-[88px] truncate">默认项目</span>
        </div>

        <WorkspaceHeaderActions
          user={user}
          notificationUnreadCount={notificationUnreadCount}
          onNotificationsClick={onNotificationsClick}
          onAccountClick={onAccountClick}
          onLogout={onLogout}
        />
      </div>
    </header>
  )
}
