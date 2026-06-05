import * as React from "react"
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@/components/ui/collapsible"
import {
  SidebarGroup,
  SidebarGroupLabel,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarMenuSub,
  SidebarMenuSubButton,
  SidebarMenuSubItem,
} from "@/components/ui/sidebar"
import { cn } from "@/lib/utils"
import { ChevronDownIcon, ChevronRightIcon } from "lucide-react"

export interface NavMainUiItem {
  id: string
  title: string
  icon?: React.ReactNode
  isActive?: boolean
  items?: {
    id: string
    title: string
    isActive?: boolean
  }[]
}

function usePersistedSectionOpen(
  storageKey: string | undefined,
  defaultOpen: boolean,
): [boolean, (open: boolean) => void] {
  const [open, setOpenState] = React.useState(() => {
    if (!storageKey || typeof window === "undefined") {
      return defaultOpen
    }
    try {
      const stored = window.localStorage.getItem(storageKey)
      if (stored !== null) {
        return stored === "true"
      }
    } catch {
      /* ignore quota / privacy mode */
    }
    return defaultOpen
  })

  const setOpen = React.useCallback(
    (next: boolean) => {
      setOpenState(next)
      if (!storageKey) {
        return
      }
      try {
        window.localStorage.setItem(storageKey, String(next))
      } catch {
        /* ignore */
      }
    },
    [storageKey],
  )

  return [open, setOpen]
}

function sectionHasActiveItem(items: NavMainUiItem[]): boolean {
  return items.some(
    (item) => item.isActive || item.items?.some((subItem) => subItem.isActive),
  )
}

function NavMainLeafItem({
  item,
  onSelectItem,
}: {
  item: NavMainUiItem
  onSelectItem: (id: string) => void
}) {
  return (
    <SidebarMenuItem>
      <SidebarMenuButton
        tooltip={item.title}
        isActive={item.isActive}
        render={<button type="button" />}
        onClick={() => onSelectItem(item.id)}
      >
        {item.icon}
        <span>{item.title}</span>
      </SidebarMenuButton>
    </SidebarMenuItem>
  )
}

function NavMainCollapsibleItem({
  item,
  onSelectItem,
}: {
  item: NavMainUiItem
  onSelectItem: (id: string) => void
}) {
  const [open, setOpen] = React.useState(Boolean(item.isActive))

  React.useEffect(() => {
    if (item.isActive) {
      setOpen(true)
    }
  }, [item.isActive])

  return (
    <Collapsible
      open={open}
      onOpenChange={setOpen}
      className="group/collapsible"
      render={<SidebarMenuItem />}
    >
      <CollapsibleTrigger
        render={<SidebarMenuButton tooltip={item.title} isActive={item.isActive} />}
      >
        {item.icon}
        <span>{item.title}</span>
        <ChevronRightIcon className="ml-auto transition-transform duration-200 group-data-open/collapsible:rotate-90" />
      </CollapsibleTrigger>
      <CollapsibleContent>
        <SidebarMenuSub>
          {item.items?.map((subItem) => (
            <SidebarMenuSubItem key={subItem.id}>
              <SidebarMenuSubButton
                isActive={subItem.isActive}
                render={<button type="button" />}
                onClick={() => onSelectItem(subItem.id)}
              >
                <span>{subItem.title}</span>
              </SidebarMenuSubButton>
            </SidebarMenuSubItem>
          ))}
        </SidebarMenuSub>
      </CollapsibleContent>
    </Collapsible>
  )
}

function NavMainMenu({
  items,
  onSelectItem,
}: {
  items: NavMainUiItem[]
  onSelectItem: (id: string) => void
}) {
  return (
    <SidebarMenu>
      {items.map((item) =>
        item.items?.length ? (
          <NavMainCollapsibleItem key={item.id} item={item} onSelectItem={onSelectItem} />
        ) : (
          <NavMainLeafItem key={item.id} item={item} onSelectItem={onSelectItem} />
        ),
      )}
    </SidebarMenu>
  )
}

function NavMainCollapsibleSection({
  items,
  groupLabel,
  groupClassName,
  defaultOpen,
  storageKey,
  onSelectItem,
}: {
  items: NavMainUiItem[]
  groupLabel: string
  groupClassName?: string
  defaultOpen: boolean
  storageKey?: string
  onSelectItem: (id: string) => void
}) {
  const hasActiveItem = sectionHasActiveItem(items)
  const [open, setOpen] = usePersistedSectionOpen(storageKey, defaultOpen)

  React.useEffect(() => {
    if (hasActiveItem) {
      setOpen(true)
    }
  }, [hasActiveItem, setOpen])

  return (
    <Collapsible
      open={open}
      onOpenChange={setOpen}
      className="group/section"
      render={<SidebarGroup className={groupClassName} />}
    >
      <CollapsibleTrigger
        render={
          <SidebarGroupLabel
            render={<button type="button" />}
            className={cn(
              "h-8 min-h-8 w-full shrink-0 cursor-pointer border-0 bg-transparent py-0 leading-none",
              "group-data-[collapsible=icon]:pointer-events-none group-data-[collapsible=icon]:opacity-0",
            )}
            aria-label={open ? `${groupLabel}收起` : `${groupLabel}展开`}
          />
        }
      >
        <span className="min-w-0 flex-1 truncate text-left">{groupLabel}</span>
        <ChevronDownIcon
          className={cn(
            "ml-auto shrink-0 opacity-70 transition-transform duration-200",
            open && "-rotate-180",
          )}
        />
      </CollapsibleTrigger>
      <CollapsibleContent>
        <NavMainMenu items={items} onSelectItem={onSelectItem} />
      </CollapsibleContent>
    </Collapsible>
  )
}

export function NavMain({
  items,
  groupLabel = "工作台",
  groupClassName,
  collapsible = false,
  defaultOpen = true,
  storageKey,
  onSelectItem,
}: {
  items: NavMainUiItem[]
  groupLabel?: string
  /** 覆盖 SidebarGroup 默认 p-2，用于分组间距微调 */
  groupClassName?: string
  /** 段级折叠（大型地图 SaaS 工具箱常见交互） */
  collapsible?: boolean
  defaultOpen?: boolean
  /** 传入则持久化展开/收起（如 nav-section-tools） */
  storageKey?: string
  onSelectItem: (id: string) => void
}) {
  if (collapsible) {
    return (
      <NavMainCollapsibleSection
        items={items}
        groupLabel={groupLabel}
        groupClassName={groupClassName}
        defaultOpen={defaultOpen}
        storageKey={storageKey}
        onSelectItem={onSelectItem}
      />
    )
  }

  return (
    <SidebarGroup className={groupClassName}>
      <SidebarGroupLabel>{groupLabel}</SidebarGroupLabel>
      <NavMainMenu items={items} onSelectItem={onSelectItem} />
    </SidebarGroup>
  )
}
