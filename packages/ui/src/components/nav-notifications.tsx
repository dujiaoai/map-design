import { SidebarMenu, SidebarMenuBadge, SidebarMenuButton, SidebarMenuItem } from "@/components/ui/sidebar"
import { cn } from "@/lib/utils"
import { BellIcon } from "lucide-react"

export function NavNotifications({ unreadCount = 0, onClick }: { unreadCount?: number; onClick?: () => void }) {
  const badgeLabel = unreadCount > 9 ? "9+" : String(unreadCount)

  return (
    <SidebarMenu>
      <SidebarMenuItem>
        <SidebarMenuButton tooltip="通知" onClick={onClick}>
          <span className="relative inline-flex shrink-0 items-center justify-center">
            <BellIcon />
            {unreadCount > 0 ? (
              <span
                aria-hidden
                className="border-background bg-destructive pointer-events-none absolute right-0 top-0 hidden size-1.5 -translate-y-1/2 translate-x-1/2 rounded-full border group-data-[collapsible=icon]:block"
              />
            ) : null}
          </span>
          <span>通知</span>
        </SidebarMenuButton>
        {unreadCount > 0 ? (
          <SidebarMenuBadge
            className={cn(
              "bg-destructive rounded-full px-1.5 text-[10px] font-semibold text-[#fff] hover:text-[var(--brand)]",
            )}
          >
            {badgeLabel}
          </SidebarMenuBadge>
        ) : null}
      </SidebarMenuItem>
    </SidebarMenu>
  )
}
