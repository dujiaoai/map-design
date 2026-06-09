"use client"

import * as React from "react"

import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { SidebarMenu, SidebarMenuButton, SidebarMenuItem } from "@/components/ui/sidebar"
import { ChevronsUpDownIcon, PlusIcon } from "lucide-react"

export interface TeamSwitcherTeam {
  id: string
  name: string
  logo: React.ReactNode
  plan: string
}

export function TeamSwitcher({
  teams,
  activeTeamId,
  onTeamChange,
}: {
  teams: TeamSwitcherTeam[]
  activeTeamId?: string
  onTeamChange?: (teamId: string) => void
}) {
  const [internalTeamId, setInternalTeamId] = React.useState(teams[0]?.id ?? "")

  const resolvedTeamId = activeTeamId ?? internalTeamId
  const activeTeam = teams.find((team) => team.id === resolvedTeamId) ?? teams[0]

  if (!activeTeam) {
    return null
  }

  function selectTeam(teamId: string) {
    if (onTeamChange) {
      onTeamChange(teamId)
    } else {
      setInternalTeamId(teamId)
    }
  }

  return (
    <SidebarMenu>
      <SidebarMenuItem>
        <DropdownMenu>
          <DropdownMenuTrigger
            render={
              <SidebarMenuButton
                size="default"
                className="data-open:bg-sidebar-accent data-open:text-sidebar-accent-foreground"
              />
            }
          >
            <div className="bg-sidebar-primary text-sidebar-primary-foreground flex aspect-square size-8 items-center justify-center rounded-lg p-1">
              {activeTeam.logo}
            </div>
            <div className="grid min-w-0 flex-1 gap-0.5 pl-2 text-left leading-tight text-brand group-data-[collapsible=icon]:hidden">
              <span className="truncate text-sm font-semibold">{activeTeam.name}</span>
              <span className="text-muted-foreground truncate text-xs">{activeTeam.plan}</span>
            </div>
            <ChevronsUpDownIcon className="text-muted-foreground ml-auto size-4 group-data-[collapsible=icon]:hidden" />
          </DropdownMenuTrigger>
          <DropdownMenuContent align="start" side="bottom" className="w-56">
            <DropdownMenuGroup>
              <DropdownMenuLabel className="text-xs">切换项目</DropdownMenuLabel>
              {teams.map((team) => (
                <DropdownMenuItem
                  key={team.id}
                  className="gap-2"
                  onClick={() => selectTeam(team.id)}
                >
                  <div className="flex size-6 shrink-0 items-center justify-center rounded-md border">
                    {team.logo}
                  </div>
                  <div className="min-w-0 flex-1">
                    <p className="truncate text-sm">{team.name}</p>
                    <p className="text-muted-foreground truncate text-xs">{team.plan}</p>
                  </div>
                </DropdownMenuItem>
              ))}
            </DropdownMenuGroup>
            <DropdownMenuSeparator />
            <DropdownMenuItem disabled className="gap-2">
              <PlusIcon className="size-4" />
              新建项目
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </SidebarMenuItem>
    </SidebarMenu>
  )
}
