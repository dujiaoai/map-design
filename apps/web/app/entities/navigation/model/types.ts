import type { ReactNode } from 'react'

/** 侧栏菜单项行为类型 */
export type NavMainItemKind = 'map-tool' | 'map-dock-module' | 'map-module' | 'route' | 'external'

/** mode：与 activeMapTool 互斥；panel：并行浮层，仅手动关闭 */
export type MapToolCategory = 'mode' | 'panel'

/**
 * 地图工具 UI 载体（大型 SaaS 分层模型）
 * - anchor: L2 画布锚点浮层，同侧垂直堆叠
 * - movable-panel: L3 激活态小面板（当前仍锚点堆叠，后续可接拖动手柄）
 * - dock: L1 固定 Dock 列；drawer: L4 地图列右侧条带（无遮罩，画布可交互）
 */
export type MapToolPresentation = 'anchor' | 'movable-panel' | 'dock' | 'drawer'

/** Coordinator / 宿主互斥域 */
export type MapToolCoordinatorGroup = 'mapInteraction' | 'drawer'

/** URL `variant` 参数，区分同 toolId 不同菜单项（如测距 vs 绘线） */
export type MapToolVariantKey = 'drawLine' | 'drawSurface'

/** 子项（叶子） */
export interface NavMainSubItem {
  id: string
  title: string
  kind: NavMainItemKind
  /** kind=map-tool 时必填 */
  toolId?: string
  /** kind=map-module | map-dock-module 时必填 */
  moduleId?: string
  /** kind=route 时必填，应用内路径 */
  url?: string
  /** kind=external 时必填 */
  href?: string
}

/** 分组或叶子 */
export interface NavMainItem {
  id: string
  title: string
  icon?: ReactNode
  kind?: NavMainItemKind
  toolId?: string
  moduleId?: string
  url?: string
  href?: string
  items?: NavMainSubItem[]
}

export interface MockToolMeta {
  title: string
  placement: 'left' | 'right'
  category: MapToolCategory
  presentation: MapToolPresentation
  /** 对齐 packages-map map-core toolIds */
  pluginToolId: string
  coordinatorGroup: MapToolCoordinatorGroup
  /** 传给插件 Entry 的 props（如 drawLine / drawSurface） */
  variant?: Record<string, boolean>
  /** 与 URL `variant` 对齐；未设表示默认子项 */
  variantKey?: MapToolVariantKey
}

export interface MockDockModuleMeta {
  title: string
}

/** 业务 Dock 模块所属侧栏段（对齐 map-plugins-catalog） */
export type MockModuleSegment = 'layers' | 'analysis' | 'ops' | 'uav' | 'app'

/** 插件 catalog 类型（Skill map-plugins-index） */
export type MapPluginCatalogType =
  | 'tool'
  | 'display'
  | 'map-chrome'
  | 'modify-panel'
  | 'parallel-panel'
  | 'hybrid'
  | 'cesium-toolkit'

export interface MockModuleMeta {
  title: string
  segment?: MockModuleSegment
  /** 对齐 packages-map / map-plugin-registry */
  pluginToolId?: string
  /** Skill 插件类型 */
  pluginType?: MapPluginCatalogType
  /** 租户能力键；未开通时侧栏不展示对应菜单项 */
  tenantFeature?: string
}

/** 侧栏多段配置（工具 / 机库 / 运营 / …） */
export interface NavMapSectionDef {
  id: string
  label: string
  items: NavMainItem[]
  /** 段级可折叠（如工具箱长列表） */
  collapsible?: boolean
  defaultOpen?: boolean
  storageKey?: string
}
