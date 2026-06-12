import {
  Button,
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuTrigger,
} from '@repo/ui'
import { Building2Icon, ChevronsUpDownIcon } from 'lucide-react'

import type { SessionTenantSummary } from '~/shared/api/admin-api'

export function AdminTeamSwitcher({
  teams,
  activeTeamId,
  onTeamChange,
}: {
  teams: SessionTenantSummary[]
  activeTeamId?: string
  onTeamChange: (tenantId: string) => void
}) {
  const activeTeam = teams.find((team) => team.id === activeTeamId) ?? teams[0]
  if (!activeTeam) return null

  return (
    <DropdownMenu>
      <DropdownMenuTrigger
        render={
          <Button
            variant="ghost"
            size="sm"
            className="h-auto w-full justify-start gap-2 px-2 py-2 text-left"
          />
        }
      >
        <div className="flex size-8 shrink-0 items-center justify-center rounded-lg border border-border/60 bg-primary/10 text-primary">
          <Building2Icon className="size-4" />
        </div>
        <div className="min-w-0 flex-1">
          <p className="truncate text-sm font-medium">{activeTeam.name}</p>
          <p className="truncate text-xs text-muted-foreground">{activeTeam.slug}</p>
        </div>
        <ChevronsUpDownIcon className="size-4 shrink-0 text-muted-foreground" />
      </DropdownMenuTrigger>
      <DropdownMenuContent align="start" className="w-56">
        <DropdownMenuLabel className="text-xs">切换租户</DropdownMenuLabel>
        {teams.map((team) => (
          <DropdownMenuItem key={team.id} onClick={() => onTeamChange(team.id)}>
            <div className="min-w-0">
              <p className="truncate text-sm">{team.name}</p>
              <p className="truncate text-xs text-muted-foreground">{team.slug}</p>
            </div>
          </DropdownMenuItem>
        ))}
      </DropdownMenuContent>
    </DropdownMenu>
  )
}
