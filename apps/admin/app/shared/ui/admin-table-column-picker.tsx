import {
  Button,
  Checkbox,
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@repo/ui'
import { Columns3Icon } from 'lucide-react'

import type { AdminTableColumnDef } from '~/shared/hooks/use-admin-table-column-prefs'

type AdminTableColumnPickerProps = {
  columns: AdminTableColumnDef[]
  visible: Record<string, boolean>
  onVisibleChange: (key: string, next: boolean) => void
  onReset: () => void
}

export function AdminTableColumnPicker({
  columns,
  visible,
  onVisibleChange,
  onReset,
}: AdminTableColumnPickerProps) {
  return (
    <DropdownMenu>
      <DropdownMenuTrigger
        render={
          <Button type="button" variant="outline" size="sm">
            <Columns3Icon className="size-3.5" />
            列
          </Button>
        }
      />
      <DropdownMenuContent align="end" className="w-52">
        <DropdownMenuGroup>
          <DropdownMenuLabel>显示列</DropdownMenuLabel>
        </DropdownMenuGroup>
        <DropdownMenuSeparator />
        {columns.map((column) => (
          <DropdownMenuItem
            key={column.key}
            closeOnClick={false}
            onClick={() => onVisibleChange(column.key, !(visible[column.key] ?? true))}
          >
            <Checkbox checked={visible[column.key] ?? true} aria-hidden tabIndex={-1} />
            <span>{column.label}</span>
          </DropdownMenuItem>
        ))}
        <DropdownMenuSeparator />
        <DropdownMenuItem onClick={onReset}>恢复默认</DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  )
}
