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
import { BadgeCheckIcon, ChevronsUpDownIcon, LogOutIcon } from 'lucide-react'

import { ThemeToggle } from '~/features/theme'

export function AdminHeaderActions({
  user,
  onAccountClick,
  onLogout,
  className,
}: {
  user: NavUserData | null
  onAccountClick?: () => void
  onLogout?: () => void
  className?: string
}) {
  const displayUser = user ?? { name: '用户', email: '', avatar: '', initials: '?' }
  const initials = displayUser.initials ?? (displayUser.name.slice(0, 1).toUpperCase() || '?')

  return (
    <div className={cn('flex h-8 shrink-0 items-center gap-1', className)}>
      <ThemeToggle />
      <DropdownMenu>
        <DropdownMenuTrigger
          render={
            <Button
              type="button"
              variant="ghost"
              size="sm"
              className="h-8 max-w-[148px] gap-1.5 px-1.5 text-muted-foreground hover:text-foreground"
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
        <DropdownMenuContent align="end" sideOffset={6} className="w-56">
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
