/** 工作台可执行动作（供命令面板、快捷键、Agent 共用） */
export type WorkspaceAction =
  | { type: 'selectNav'; navItemId: string }
  | { type: 'clearTools' }
  | { type: 'clearPanelTools' }
  | { type: 'mapSearch'; query: string }
  | { type: 'openMapSearchDrawer'; query?: string }

export type WorkspaceCommandGroup =
  | 'recent'
  | 'tool'
  | 'module'
  | 'dock'
  | 'navigation'
  | 'search'
  | 'system'

export const WORKSPACE_COMMAND_GROUP_LABELS: Record<WorkspaceCommandGroup, string> = {
  recent: '最近使用',
  tool: '地图工具',
  module: '业务模块',
  dock: '机库',
  navigation: '应用与链接',
  search: '地图搜索',
  system: '工作台',
}

export const WORKSPACE_COMMAND_GROUP_ORDER: WorkspaceCommandGroup[] = [
  'recent',
  'search',
  'tool',
  'module',
  'dock',
  'navigation',
  'system',
]

export interface WorkspaceCommandItem {
  id: string
  title: string
  subtitle?: string
  keywords: string[]
  group: WorkspaceCommandGroup
  action: WorkspaceAction
  active?: boolean
}

export function workspaceActionKey(action: WorkspaceAction): string {
  switch (action.type) {
    case 'selectNav':
      return `nav:${action.navItemId}`
    case 'clearTools':
      return 'system:clear-tools'
    case 'clearPanelTools':
      return 'system:clear-panels'
    case 'mapSearch':
      return `search:${action.query}`
    case 'openMapSearchDrawer':
      return `search-drawer:${action.query ?? ''}`
    default:
      return 'unknown'
  }
}
