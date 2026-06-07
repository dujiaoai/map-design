import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
  Button,
  Separator,
  SidebarTrigger,
  cn,
  type NavUserData,
} from '@repo/ui'
import { ScanSearchIcon } from 'lucide-react'
import { type CSSProperties } from 'react'
import { useShallow } from 'zustand/react/shallow'

import {
  selectWorkspaceBreadcrumbTrail,
  useMapWorkspaceStore,
} from '~/features/map-workspace'
import { WORKSPACE_CHROME_ICON_BUTTON_CLASS } from '~/shared/lib/workspace-chrome-styles'
import { WorkspaceCommandTrigger } from '~/widgets/workspace-command-palette'
import { WorkspaceHeaderActions } from '~/widgets/workspace-chrome'

export function MapWorkspaceHeader({
  className,
  style,
  user,
  notificationUnreadCount,
  onNotificationsClick,
  onAccountClick,
  onLogout,
}: {
  className?: string
  style?: CSSProperties
  user: NavUserData | null
  notificationUnreadCount?: number
  onNotificationsClick?: () => void
  onAccountClick?: () => void
  onLogout?: () => void
}) {
  const breadcrumbTrail = useMapWorkspaceStore(useShallow(selectWorkspaceBreadcrumbTrail))
  const openCommandPalette = useMapWorkspaceStore((state) => state.openCommandPalette)

  function openMobileSearch() {
    openCommandPalette()
  }

  return (
    <header
      className={cn(
        'workspace-header cc-glass-bar flex h-12 shrink-0 items-center gap-2 px-2 sm:px-3',
        className,
      )}
      style={style}
    >
      <div className="workspace-header-lead flex min-w-0 items-center gap-2 sm:gap-2.5">
        <SidebarTrigger className="workspace-header-trigger" />
        <Separator
          orientation="vertical"
          className="workspace-header-divider mx-0 h-4 shrink-0 bg-border dark:bg-white/10"
        />

        <Breadcrumb className="workspace-header-breadcrumb min-w-0">
          <BreadcrumbList className="flex-nowrap items-center gap-1.5 text-[13px] leading-none sm:gap-2">
            <BreadcrumbItem className="inline-flex h-8 min-w-0 max-w-[7.5rem] shrink items-center sm:max-w-[10rem]">
              <span className="workspace-header-crumb cc-display truncate text-foreground/80 dark:text-white/70">
                云眼综合服务平台
              </span>
            </BreadcrumbItem>
            {breadcrumbTrail.map((label, index) => {
              const isLast = index === breadcrumbTrail.length - 1

              return (
                <BreadcrumbTrailSegment key={`${label}-${index}`} label={label} active={isLast} />
              )
            })}
          </BreadcrumbList>
        </Breadcrumb>
      </div>

      <div className="mx-1 hidden min-w-0 flex-1 md:block lg:max-w-md xl:max-w-lg">
        <WorkspaceCommandTrigger onOpen={() => openCommandPalette()} />
      </div>

      <div className="ml-auto flex shrink-0 items-center gap-1 sm:gap-2">
        <Button
          type="button"
          variant="ghost"
          size="icon-sm"
          className={cn(WORKSPACE_CHROME_ICON_BUTTON_CLASS, 'md:hidden')}
          aria-label="搜索"
          onClick={openMobileSearch}
        >
          <ScanSearchIcon className="size-4" />
        </Button>

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

function BreadcrumbTrailSegment({ label, active }: { label: string; active: boolean }) {
  return (
    <>
      <BreadcrumbSeparator className="inline-flex h-8 items-center [&>svg]:size-3" />
      <BreadcrumbItem className="inline-flex h-8 min-w-0 items-center">
        <BreadcrumbPage
          className={cn(
            'workspace-header-crumb truncate',
            active
              ? 'workspace-breadcrumb-active cc-display text-foreground dark:text-white/85'
              : 'text-foreground/80 dark:text-white/70',
          )}
        >
          {label}
        </BreadcrumbPage>
      </BreadcrumbItem>
    </>
  )
}
