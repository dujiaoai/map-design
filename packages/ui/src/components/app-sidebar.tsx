"use client"

import * as React from "react"

import { NavMain, type NavMainUiItem } from "@/components/nav-main"
import { NavNotifications } from "@/components/nav-notifications"
import { NavUser, type NavUserData } from "@/components/nav-user"
import { SidebarBrand, type SidebarBrandProps } from "@/components/sidebar-brand"
import { TeamSwitcher, type TeamSwitcherTeam } from "@/components/team-switcher"
import { Sidebar, SidebarContent, SidebarFooter, SidebarHeader, SidebarRail } from "@/components/ui/sidebar"

const defaultData = {
  user: {
    name: "shadcn",
    email: "m@example.com",
    avatar: "/avatars/shadcn.jpg",
  },
  teams: [
    {
      id: "default",
      name: "云眼",
      logo: <img src="/avatars/logo.png" alt="云眼" className="w-full" />,
      plan: "综合服务平台",
    },
  ],
}

export interface NavMapSectionUi {
  id: string
  label: string
  items: NavMainUiItem[]
  /** 段标题可点击收起/展开（工具箱等长列表） */
  collapsible?: boolean
  defaultOpen?: boolean
  /** 持久化 key，默认 nav-section-{id} */
  storageKey?: string
}

function sectionGroupClassName(index: number, total: number): string | undefined {
  if (total <= 1) return undefined
  if (index === 0) return "px-2 pt-2 pb-[0.35rem]"
  if (index === total - 1) return "px-2 pt-[0.35rem] pb-2"
  return "px-2 py-[0.35rem]"
}

export function AppSidebar({
  user: userProp,
  navMain = [],
  navMapSections,
  navToolItems,
  navWorkspaceItems,
  navGroupLabel = "工作台",
  navToolGroupLabel = "工具",
  navWorkspaceGroupLabel = "工作台",
  onNavSelect,
  onAccountClick,
  onNotificationsClick,
  notificationUnreadCount,
  onLogout,
  hideFooter = false,
  hideNotifications = false,
  brand,
  teams = defaultData.teams,
  activeTeamId,
  onTeamChange,
  ...props
}: React.ComponentProps<typeof Sidebar> & {
  user?: NavUserData | null
  /** @deprecated 单分组 */
  navMain?: NavMainUiItem[]
  /** 推荐：工具 / 机库 / 项目 / 图层 / 运营 / 分析 / 应用 */
  navMapSections?: NavMapSectionUi[]
  /** @deprecated 与 navMapSections 二选一 */
  navToolItems?: NavMainUiItem[]
  /** @deprecated 与 navMapSections 二选一 */
  navWorkspaceItems?: NavMainUiItem[]
  navGroupLabel?: string
  navToolGroupLabel?: string
  navWorkspaceGroupLabel?: string
  onNavSelect?: (id: string) => void
  onAccountClick?: () => void
  onNotificationsClick?: () => void
  notificationUnreadCount?: number
  onLogout?: () => void
  /** 工作台顶栏已承载通知/账号时隐藏侧栏页脚 */
  hideFooter?: boolean
  /** 隐藏侧栏通知入口（运营后台等无通知中心的场景） */
  hideNotifications?: boolean
  /** 静态品牌头（Logo + 平台名），与 teams 二选一 */
  brand?: SidebarBrandProps
  teams?: TeamSwitcherTeam[]
  activeTeamId?: string
  onTeamChange?: (teamId: string) => void
}) {
  const user = userProp ?? defaultData.user

  const legacySplit =
    navMapSections === undefined &&
    (navToolItems !== undefined || navWorkspaceItems !== undefined)
  const toolItems = navToolItems ?? []
  const workspaceItems = navWorkspaceItems ?? []
  const sections =
    navMapSections ??
    (legacySplit
      ? [
          ...(toolItems.length > 0
            ? [{ id: "tools", label: navToolGroupLabel, items: toolItems }]
            : []),
          ...(workspaceItems.length > 0
            ? [{ id: "workspace", label: navWorkspaceGroupLabel, items: workspaceItems }]
            : []),
        ]
      : [])

  const useSectionsNav = sections.length > 0

  return (
    <Sidebar collapsible="icon" {...props}>
      <SidebarHeader>
        {brand ? (
          <SidebarBrand {...brand} />
        ) : (
          <TeamSwitcher teams={teams} activeTeamId={activeTeamId} onTeamChange={onTeamChange} />
        )}
      </SidebarHeader>
      <SidebarContent>
        {onNavSelect ? (
          useSectionsNav ? (
            <div className="flex flex-col gap-[0.35rem]">
              {sections.map((section, index) =>
                section.items.length > 0 ? (
                  <NavMain
                    key={section.id}
                    items={section.items}
                    groupLabel={section.label}
                    groupClassName={sectionGroupClassName(index, sections.length)}
                    collapsible={section.collapsible}
                    defaultOpen={section.defaultOpen}
                    storageKey={
                      section.storageKey ??
                      (section.collapsible ? `nav-section-${section.id}` : undefined)
                    }
                    onSelectItem={onNavSelect}
                  />
                ) : null,
              )}
            </div>
          ) : navMain.length > 0 ? (
            <NavMain items={navMain} groupLabel={navGroupLabel} onSelectItem={onNavSelect} />
          ) : null
        ) : null}
      </SidebarContent>
      {!hideFooter ? (
        <SidebarFooter>
          {!hideNotifications ? (
            <NavNotifications unreadCount={notificationUnreadCount} onClick={onNotificationsClick} />
          ) : null}
          <NavUser user={user} onAccountClick={onAccountClick} onLogout={onLogout} />
        </SidebarFooter>
      ) : null}
      <SidebarRail />
    </Sidebar>
  )
}
