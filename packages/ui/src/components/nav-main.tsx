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


function useCommandCenterNavFxEnabled() {
  const [enabled, setEnabled] = React.useState(() => {
    if (typeof document === 'undefined') {
      return false
    }
    return document.documentElement.classList.contains('dark')
  })

  React.useEffect(() => {
    const root = document.documentElement
    const sync = () => setEnabled(root.classList.contains('dark'))
    sync()
    const observer = new MutationObserver(sync)
    observer.observe(root, { attributes: true, attributeFilter: ['class'] })
    return () => observer.disconnect()
  }, [])

  return enabled
}

/** 工作台侧栏：暗色指挥舱点击涟漪 + 激活脉冲（样式见 saas-web home.css） */
function useNavMenuInteraction(isActive?: boolean) {
  const commandCenterFx = useCommandCenterNavFxEnabled()
  const [flash, setFlash] = React.useState(false)
  const [rip, setRip] = React.useState({ x: 50, y: 50 })
  const [activePulse, setActivePulse] = React.useState(false)

  React.useEffect(() => {
    if (!commandCenterFx || !isActive) {
      return
    }
    setActivePulse(true)
    const timer = window.setTimeout(() => setActivePulse(false), 640)
    return () => window.clearTimeout(timer)
  }, [commandCenterFx, isActive])

  const handleSelect = React.useCallback(
    (event: React.MouseEvent<HTMLElement>, onSelect: () => void) => {
      if (commandCenterFx) {
        const rect = event.currentTarget.getBoundingClientRect()
        setRip({
          x: ((event.clientX - rect.left) / rect.width) * 100,
          y: ((event.clientY - rect.top) / rect.height) * 100,
        })
        setFlash(true)
        window.setTimeout(() => setFlash(false), 420)
      }
      onSelect()
    },
    [commandCenterFx],
  )

  return {
    fxClassName: commandCenterFx
      ? cn(
          'ws-nav-interactive',
          flash && 'ws-nav-flash',
          activePulse && 'ws-nav-active-pulse',
        )
      : undefined,
    fxStyle: commandCenterFx
      ? ({
          '--ws-nav-rip-x': `${rip.x}%`,
          '--ws-nav-rip-y': `${rip.y}%`,
        } as React.CSSProperties)
      : undefined,
    handleSelect,
  }
}

function NavMainLeafItem({
  item,
  onSelectItem,
}: {
  item: NavMainUiItem
  onSelectItem: (id: string) => void
}) {
  const { fxClassName, fxStyle, handleSelect } = useNavMenuInteraction(item.isActive)

  return (
    <SidebarMenuItem>
      <SidebarMenuButton
        tooltip={item.title}
        isActive={item.isActive}
        className={fxClassName}
        style={fxStyle}
        render={<button type="button" />}
        onClick={(event) => handleSelect(event, () => onSelectItem(item.id))}
      >
        {item.icon}
        <span>{item.title}</span>
      </SidebarMenuButton>
    </SidebarMenuItem>
  )
}

function NavMainSubLeafItem({
  subItem,
  onSelectItem,
}: {
  subItem: { id: string; title: string; isActive?: boolean }
  onSelectItem: (id: string) => void
}) {
  const { fxClassName, fxStyle, handleSelect } = useNavMenuInteraction(subItem.isActive)

  return (
    <SidebarMenuSubItem>
      <SidebarMenuSubButton
        isActive={subItem.isActive}
        className={fxClassName}
        style={fxStyle}
        render={<button type="button" />}
        onClick={(event) => handleSelect(event, () => onSelectItem(subItem.id))}
      >
        <span>{subItem.title}</span>
      </SidebarMenuSubButton>
    </SidebarMenuSubItem>
  )
}

function NavMainCollapsibleItem({
  item,
  onSelectItem,
}: {
  item: NavMainUiItem
  onSelectItem: (id: string) => void
}) {
  const commandCenterFx = useCommandCenterNavFxEnabled()
  const [open, setOpen] = usePersistedSectionOpen(
    `nav-group-${item.id}`,
    Boolean(item.isActive),
  )

  React.useEffect(() => {
    if (item.isActive) {
      setOpen(true)
    }
  }, [item.isActive, setOpen])

  return (
    <Collapsible
      open={open}
      onOpenChange={setOpen}
      className="group/collapsible"
      render={<SidebarMenuItem />}
    >
      <CollapsibleTrigger
        render={
          <SidebarMenuButton
            tooltip={item.title}
            isActive={item.isActive}
            className={cn(
              commandCenterFx && 'ws-nav-interactive ws-nav-collapsible-trigger',
            )}
          />
        }
      >
        {item.icon}
        <span>{item.title}</span>
        <ChevronRightIcon className="ml-auto transition-transform duration-200 group-data-open/collapsible:rotate-90" />
      </CollapsibleTrigger>
      <CollapsibleContent>
        <SidebarMenuSub>
          {item.items?.map((subItem) => (
            <NavMainSubLeafItem
              key={subItem.id}
              subItem={subItem}
              onSelectItem={onSelectItem}
            />
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
  sectionOpen,
  onSectionOpenChange,
  onSelectItem,
}: {
  items: NavMainUiItem[]
  groupLabel: string
  groupClassName?: string
  defaultOpen: boolean
  storageKey?: string
  /** 受控展开（手风琴模式由 AppSidebar 统一管理） */
  sectionOpen?: boolean
  onSectionOpenChange?: (open: boolean) => void
  onSelectItem: (id: string) => void
}) {
  const isControlled = onSectionOpenChange !== undefined
  const [persistedOpen, setPersistedOpen] = usePersistedSectionOpen(
    isControlled ? undefined : storageKey,
    defaultOpen,
  )
  const open = isControlled ? Boolean(sectionOpen) : persistedOpen
  const setOpen = isControlled ? onSectionOpenChange : setPersistedOpen

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
              "ws-nav-section-label h-8 min-h-8 w-full shrink-0 cursor-pointer border-0 bg-transparent py-0 leading-none",
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
  sectionOpen,
  onSectionOpenChange,
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
  /** 受控展开，与 onSectionOpenChange 成对使用 */
  sectionOpen?: boolean
  onSectionOpenChange?: (open: boolean) => void
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
        sectionOpen={sectionOpen}
        onSectionOpenChange={onSectionOpenChange}
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
