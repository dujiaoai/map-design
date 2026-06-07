import {
  mockNavAnalysisItems,
  mockNavLayerItems,
  mockNavMapSectionDefs,
  mockNavOpsItems,
  mockNavUavItems,
  type NavMainItem,
} from '~/entities/navigation'
import { findNavSubItemByDockModuleId, findNavSubItemByModuleId } from '~/entities/navigation'

/** URL 路径段（/data 聚合图层+分析模块） */
export type WorkspaceModuleSection = 'data' | 'uav' | 'ops'

/** 侧栏段 id（mockNavMapSectionDefs） */
export type NavSidebarSectionId = 'layers' | 'analysis' | 'ops' | 'uav' | 'app'

const DATA_DOCK_MODULE_IDS = [...mockNavLayerItems, ...mockNavAnalysisItems]
  .map((item) => item.moduleId)
  .filter(Boolean) as string[]

const SECTION_MODULE_IDS: Record<WorkspaceModuleSection, readonly string[]> = {
  data: DATA_DOCK_MODULE_IDS,
  uav: mockNavUavItems.map((item) => item.moduleId).filter(Boolean) as string[],
  ops: mockNavOpsItems.map((item) => item.moduleId).filter(Boolean) as string[],
}

const NON_DATA_SECTIONS = new Set<WorkspaceModuleSection>(['uav', 'ops'])

export function isNonDataModuleSection(
  section: WorkspaceModuleSection,
): section is Exclude<WorkspaceModuleSection, 'data'> {
  return NON_DATA_SECTIONS.has(section)
}

export function isKnownModuleInSection(
  section: WorkspaceModuleSection,
  moduleId: string,
): boolean {
  return SECTION_MODULE_IDS[section].includes(moduleId)
}

export function resolveModuleSectionByModuleId(
  moduleId: string,
): WorkspaceModuleSection | null {
  for (const section of Object.keys(SECTION_MODULE_IDS) as WorkspaceModuleSection[]) {
    if (isKnownModuleInSection(section, moduleId)) {
      return section
    }
  }
  return null
}

export function resolveNavSidebarSectionByNavItemId(
  navItemId: string,
): NavSidebarSectionId | null {
  for (const section of mockNavMapSectionDefs) {
    if (section.items.some((item) => item.id === navItemId)) {
      return section.id as NavSidebarSectionId
    }
  }
  return null
}

/** @deprecated 侧栏段请用 resolveNavSidebarSectionByNavItemId；此处保留 URL 段解析 */
export function resolveModuleSectionByNavItemId(
  navItemId: string,
): WorkspaceModuleSection | null {
  const sidebarSection = resolveNavSidebarSectionByNavItemId(navItemId)
  if (!sidebarSection) {
    return null
  }
  if (sidebarSection === 'layers' || sidebarSection === 'analysis') {
    return 'data'
  }
  if (sidebarSection === 'uav' || sidebarSection === 'ops') {
    return sidebarSection
  }
  return null
}

export interface WorkspaceModuleRoute {
  section: WorkspaceModuleSection
  moduleId: string
}

const MODULE_PATH_RE = /^\/(data|uav|ops)\/([^/]+)\/?$/

export function parseWorkspaceModulePath(pathname: string): WorkspaceModuleRoute | null {
  const match = MODULE_PATH_RE.exec(pathname)
  if (!match) {
    return null
  }
  const section = match[1] as WorkspaceModuleSection
  const moduleId = match[2]
  if (!isKnownModuleInSection(section, moduleId)) {
    return null
  }
  return { section, moduleId }
}

export function buildWorkspaceModulePath(route: WorkspaceModuleRoute): string {
  return `/${route.section}/${route.moduleId}`
}

export function resolveNavItemFromModuleRoute(
  route: WorkspaceModuleRoute,
  items: NavMainItem[],
): NavMainItem | undefined {
  if (route.section === 'uav') {
    return findNavSubItemByDockModuleId(items, route.moduleId)
  }
  return findNavSubItemByModuleId(items, route.moduleId)
}
