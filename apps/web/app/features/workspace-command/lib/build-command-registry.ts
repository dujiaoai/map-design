import {
  findNavSectionIdByNavItemId,
  mockModuleMeta,
  mockNavMainItems,
  mockNavMapSectionDefs,
  mockNavToolItems,
  mockToolMeta,
  type NavMainItem,
  type NavMainSubItem,
  type NavMapSectionDef,
} from '~/entities/navigation'
import { QUICK_TOOL_GROUP_LABELS, QUICK_TOOL_GROUP_ORDER, resolveQuickToolDef } from '~/features/map-quick-toolbar'
import { buildSearchSuggestions } from '~/features/global-search'

import {
  type WorkspaceAction,
  type WorkspaceCommandGroup,
  type WorkspaceCommandItem,
  WORKSPACE_COMMAND_GROUP_LABELS,
  WORKSPACE_COMMAND_GROUP_ORDER,
  workspaceActionKey,
} from './workspace-action'

const NAV_SECTION_ORDER = ['layers', 'analysis', 'ops', 'uav', 'app'] as const

const PLUGIN_TYPE_LABELS: Record<string, string> = {
  display: '展示层',
  'modify-panel': '编辑面板',
  'parallel-panel': '并行面板',
  tool: '地图工具',
}

function navSectionSortIndex(navItemId: string): number {
  const sectionId = findNavSectionIdByNavItemId(navItemId)
  if (sectionId) {
    const index = NAV_SECTION_ORDER.indexOf(sectionId as (typeof NAV_SECTION_ORDER)[number])
    return index >= 0 ? index : NAV_SECTION_ORDER.length
  }

  const quick = resolveQuickToolDef(navItemId)
  if (quick) {
    const groupIndex = QUICK_TOOL_GROUP_ORDER.indexOf(quick.group)
    return NAV_SECTION_ORDER.length + 1 + (groupIndex >= 0 ? groupIndex : QUICK_TOOL_GROUP_ORDER.length)
  }

  return NAV_SECTION_ORDER.length + QUICK_TOOL_GROUP_ORDER.length + 1
}

function compareNavCommandItems(a: WorkspaceCommandItem, b: WorkspaceCommandItem): number {
  const navItemIdA = a.action.type === 'selectNav' ? a.action.navItemId : null
  const navItemIdB = b.action.type === 'selectNav' ? b.action.navItemId : null

  if (!navItemIdA || !navItemIdB) {
    return 0
  }

  const sectionDelta = navSectionSortIndex(navItemIdA) - navSectionSortIndex(navItemIdB)
  if (sectionDelta !== 0) {
    return sectionDelta
  }

  return a.title.localeCompare(b.title, 'zh-CN')
}

const SYSTEM_COMMANDS: WorkspaceCommandItem[] = [
  {
    id: 'system-clear-tools',
    title: '关闭当前地图工具',
    subtitle: '退出测距、绘点等互斥工具',
    keywords: ['关闭', '退出', 'esc', '工具'],
    group: 'system',
    action: { type: 'clearTools' },
  },
  {
    id: 'system-clear-panels',
    title: '关闭所有并行面板',
    subtitle: '关闭卷帘、影像对比等浮层',
    keywords: ['关闭', '面板', '浮层'],
    group: 'system',
    action: { type: 'clearPanelTools' },
  },
  {
    id: 'system-open-search-drawer',
    title: '打开地图搜索面板',
    subtitle: '在右侧条带查看检索结果',
    keywords: ['搜索', '检索', '地点'],
    group: 'system',
    action: { type: 'openMapSearchDrawer' },
  },
]

function resolveSectionLabel(
  navItemId: string,
  sectionDefs: NavMapSectionDef[] = mockNavMapSectionDefs,
): string | undefined {
  for (const section of sectionDefs) {
    for (const item of section.items) {
      if (item.id === navItemId) {
        return section.label
      }
      if (item.items?.some((sub) => sub.id === navItemId)) {
        return section.label
      }
    }
  }

  if (mockNavToolItems.some((item) => item.id === navItemId)) {
    const quick = resolveQuickToolDef(navItemId)
    if (quick) {
      return QUICK_TOOL_GROUP_LABELS[quick.group]
    }
    return '地图工具'
  }

  return undefined
}

function commandGroupForKind(kind: NavMainSubItem['kind']): WorkspaceCommandGroup {
  switch (kind) {
    case 'map-tool':
      return 'tool'
    case 'map-module':
      return 'module'
    case 'map-dock-module':
      return 'dock'
    case 'route':
    case 'external':
      return 'navigation'
    default:
      return 'system'
  }
}

function buildNavCommandItem(
  leaf: NavMainSubItem,
  activeNavItemIds: string[],
): WorkspaceCommandItem | null {
  const sectionLabel = resolveSectionLabel(leaf.id)
  const group = commandGroupForKind(leaf.kind)

  let subtitle = sectionLabel
  if (leaf.kind === 'map-tool' && leaf.toolId) {
    const meta = mockToolMeta[leaf.toolId]
    if (meta?.category === 'panel') {
      subtitle = [sectionLabel, '并行面板'].filter(Boolean).join(' · ')
    } else if (meta?.coordinatorGroup === 'drawer') {
      subtitle = [sectionLabel, '右侧条带'].filter(Boolean).join(' · ')
    }
  }

  if (leaf.kind === 'map-module' && leaf.moduleId) {
    const meta = mockModuleMeta[leaf.moduleId]
    const typeLabel = meta?.pluginType ? PLUGIN_TYPE_LABELS[meta.pluginType] : undefined
    subtitle = [sectionLabel, typeLabel].filter(Boolean).join(' · ')
  }

  if (leaf.kind === 'route' && leaf.url) {
    subtitle = [sectionLabel, leaf.url].filter(Boolean).join(' · ')
  }

  if (leaf.kind === 'external' && leaf.href) {
    subtitle = [sectionLabel, '外部链接'].filter(Boolean).join(' · ')
  }

  const moduleMeta = leaf.moduleId ? mockModuleMeta[leaf.moduleId] : undefined
  const toolMeta = leaf.toolId ? mockToolMeta[leaf.toolId] : undefined

  const keywords = [
    leaf.title,
    sectionLabel ?? '',
    leaf.toolId ?? '',
    leaf.moduleId ?? '',
    toolMeta?.pluginToolId ?? '',
    moduleMeta?.pluginToolId ?? '',
    moduleMeta?.pluginType ?? '',
  ].filter(Boolean)

  return {
    id: `nav:${leaf.id}`,
    title: leaf.title,
    subtitle,
    keywords,
    group,
    action: { type: 'selectNav', navItemId: leaf.id },
    active: activeNavItemIds.includes(leaf.id),
  }
}

function flattenNavLeaves(items: NavMainItem[]): NavMainSubItem[] {
  const leaves: NavMainSubItem[] = []

  for (const item of items) {
    if (item.items?.length) {
      leaves.push(...item.items)
      continue
    }

    if (!item.kind) {
      continue
    }

    leaves.push({
      id: item.id,
      title: item.title,
      kind: item.kind,
      toolId: item.toolId,
      moduleId: item.moduleId,
      url: item.url,
      href: item.href,
    })
  }

  return leaves
}

export function buildWorkspaceCommandRegistry(
  items: NavMainItem[] = mockNavMainItems,
  activeNavItemIds: string[] = [],
): WorkspaceCommandItem[] {
  const navCommands = flattenNavLeaves(items)
    .map((leaf) => buildNavCommandItem(leaf, activeNavItemIds))
    .filter((item): item is WorkspaceCommandItem => Boolean(item))
    .sort(compareNavCommandItems)

  return [...navCommands, ...SYSTEM_COMMANDS]
}

export function buildSearchCommandItems(query: string): WorkspaceCommandItem[] {
  const trimmed = query.trim()
  if (!trimmed) {
    return []
  }

  return buildSearchSuggestions(trimmed, 5)
    .filter((suggestion) => suggestion.kind !== 'hint')
    .map((suggestion) => ({
      id: `search:${suggestion.id}`,
      title: suggestion.title,
      subtitle: suggestion.subtitle ?? '地图搜索',
      keywords: [suggestion.title, suggestion.query, suggestion.subtitle ?? ''],
      group: 'search' as const,
      action: { type: 'openMapSearchDrawer', query: suggestion.query } satisfies WorkspaceAction,
    }))
}

export function groupResolvedCommandItems(items: WorkspaceCommandItem[]): Array<{
  group: WorkspaceCommandGroup
  label: string
  items: WorkspaceCommandItem[]
}> {
  return WORKSPACE_COMMAND_GROUP_ORDER.map((group) => ({
    group,
    label: WORKSPACE_COMMAND_GROUP_LABELS[group],
    items: items.filter((item) => item.group === group),
  })).filter((section) => section.items.length > 0)
}

export function resolveCommandItems(input: {
  query: string
  registry: WorkspaceCommandItem[]
  recentActionKeys: string[]
}): WorkspaceCommandItem[] {
  const { query, registry, recentActionKeys } = input
  const trimmed = query.trim()

  const filteredRegistry = trimmed
    ? filterCommandItems(registry, trimmed)
    : registry.filter((item) => item.group !== 'search')

  const searchItems = buildSearchCommandItems(trimmed)
  const merged = dedupeCommandItems([...searchItems, ...filteredRegistry])

  if (!trimmed && recentActionKeys.length > 0) {
    const recentItems = recentActionKeys
      .map((key) => registry.find((item) => workspaceActionKey(item.action) === key))
      .filter((item): item is WorkspaceCommandItem => Boolean(item))
      .map((item) => ({ ...item, group: 'recent' as const, id: `recent:${item.id}` }))

    return dedupeCommandItems([...recentItems, ...merged.filter((item) => item.group !== 'recent')])
  }

  return merged
}

export function filterCommandItems(
  items: WorkspaceCommandItem[],
  query: string,
): WorkspaceCommandItem[] {
  const tokens = query
    .trim()
    .toLowerCase()
    .split(/\s+/)
    .filter(Boolean)

  if (tokens.length === 0) {
    return items
  }

  return items.filter((item) => {
    const haystack = [item.title, item.subtitle ?? '', ...item.keywords].join(' ').toLowerCase()
    return tokens.every((token) => haystack.includes(token))
  })
}

function dedupeCommandItems(items: WorkspaceCommandItem[]): WorkspaceCommandItem[] {
  const seen = new Set<string>()
  const result: WorkspaceCommandItem[] = []

  for (const item of items) {
    if (seen.has(item.id)) {
      continue
    }
    seen.add(item.id)
    result.push(item)
  }

  return result
}
