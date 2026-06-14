import {
  Avatar,
  AvatarFallback,
  AvatarImage,
  Button,
  cn,
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
  type NavUserData,
} from '@repo/ui'
import { hasPermission, PermissionCodes } from '@repo/auth'
import { BadgeCheckIcon, BellIcon, ChevronsUpDownIcon, CoinsIcon, LogOutIcon } from 'lucide-react'
import { Link } from 'react-router'

import { ThemeToggle } from '~/features/theme'
import { BillingWalletCard } from '~/features/billing'
import { auth } from '~/shared/auth/client'
import { usesSaasSessionBootstrap } from '~/shared/session/fetch-saas-session'
import {
  WORKSPACE_CHROME_ICON_BUTTON_CLASS,
  WORKSPACE_CHROME_TEXT_BUTTON_CLASS,
} from '~/shared/lib/workspace-chrome-styles'

export function WorkspaceHeaderActions({
  user,
  notificationUnreadCount = 0,
  onNotificationsClick,
  onAccountClick,
  onLogout,
  className,
}: {
  user: NavUserData | null
  notificationUnreadCount?: number
  onNotificationsClick?: () => void
  onAccountClick?: () => void
  onLogout?: () => void
  className?: string
}) {
  const displayUser = user ?? { name: '用户', email: '', avatar: '', initials: '?' }
  const initials = displayUser.initials ?? (displayUser.name.slice(0, 1).toUpperCase() || '?')
  const badgeLabel = notificationUnreadCount > 9 ? '9+' : String(notificationUnreadCount)
  const showWallet =
    usesSaasSessionBootstrap() &&
    hasPermission(auth.getSession()?.user.permissions, PermissionCodes.BILLING_WALLET_READ)

  return (
    <div className={cn('flex shrink-0 items-center gap-1', className)}>
      {showWallet ? <BillingWalletCard variant="compact" /> : null}
      <ThemeToggle className={WORKSPACE_CHROME_ICON_BUTTON_CLASS} />

      <Button
        type="button"
        variant="ghost"
        size="icon-sm"
        className={cn(WORKSPACE_CHROME_ICON_BUTTON_CLASS, 'relative')}
        aria-label="通知"
        onClick={onNotificationsClick}
      >
        <BellIcon className="size-4" />
        {notificationUnreadCount > 0 ? (
          <span className="bg-destructive absolute top-1 right-1 flex min-w-4 -translate-y-1/2 translate-x-1/2 items-center justify-center rounded-full px-0.5 text-[9px] leading-4 font-semibold text-white">
            {badgeLabel}
          </span>
        ) : null}
      </Button>

      <DropdownMenu>
        <DropdownMenuTrigger
          render={
            <Button
              type="button"
              variant="ghost"
              size="sm"
              className={cn(
                'h-8 max-w-[148px] gap-1.5 px-1.5',
                WORKSPACE_CHROME_TEXT_BUTTON_CLASS,
              )}
            />
          }
        >
          <Avatar className="size-7 rounded-md">
            <AvatarImage src={displayUser.avatar} alt={displayUser.name} className="rounded-md" />
            <AvatarFallback className="rounded-md text-xs">{initials}</AvatarFallback>
          </Avatar>
          <span className="hidden max-w-[72px] truncate text-xs sm:inline">{displayUser.name}</span>
          <ChevronsUpDownIcon className="hidden size-3.5 opacity-60 sm:inline" />
        </DropdownMenuTrigger>
        <DropdownMenuContent
          align="end"
          sideOffset={6}
          className="cc-menu-popover w-56 max-h-none overflow-hidden border-border bg-popover text-popover-foreground data-open:animate-none data-closed:animate-none"
        >
          <DropdownMenuGroup>
            <DropdownMenuLabel className="p-0 font-normal">
              <div className="flex items-center gap-2 px-1 py-1.5 text-left text-sm">
                <Avatar className="size-8 rounded-md">
                  <AvatarImage src={displayUser.avatar} alt={displayUser.name} className="rounded-md" />
                  <AvatarFallback className="rounded-md">{initials}</AvatarFallback>
                </Avatar>
                <div className="grid min-w-0 flex-1 text-left leading-tight">
                  <span className="truncate font-medium">{displayUser.name}</span>
                  <span className="text-muted-foreground truncate text-xs">{displayUser.email || '—'}</span>
                </div>
              </div>
            </DropdownMenuLabel>
          </DropdownMenuGroup>
          <DropdownMenuSeparator />
          <DropdownMenuItem onClick={onAccountClick}>
            <BadgeCheckIcon />
            账号
          </DropdownMenuItem>
          {showWallet ? (
            <DropdownMenuItem render={<Link to="/billing" />}>
              <CoinsIcon />
              积分钱包
            </DropdownMenuItem>
          ) : null}
          <DropdownMenuSeparator />
          <DropdownMenuItem onClick={onLogout}>
            <LogOutIcon />
            退出
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>
    </div>
  )
}
