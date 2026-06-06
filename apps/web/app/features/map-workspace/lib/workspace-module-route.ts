import {
  mockNavDataItems,
  mockNavOpsItems,
  mockNavPanoramaModuleItems,
  mockNavUavItems,
  type NavMainItem,
} from '~/entities/navigation'
import { findNavSubItemByDockModuleId, findNavSubItemByModuleId } from '~/entities/navigation'

export type WorkspaceModuleSection = 'data' | 'uav' | 'ops' | 'panorama'

const SECTION_MODULE_IDS: Record<WorkspaceModuleSection, readonly string[]> = {
  data: mockNavDataItems.map((item) => item.moduleId).filter(Boolean) as string[],
  uav: mockNavUavItems.map((item) => item.moduleId).filter(Boolean) as string[],
  ops: mockNavOpsItems.map((item) => item.moduleId).filter(Boolean) as string[],
  panorama: mockNavPanoramaModuleItems
    .map((item) => item.moduleId)
    .filter(Boolean) as string[],
}

const NON_DATA_SECTIONS = new Set<WorkspaceModuleSection>(['uav', 'ops', 'panorama'])

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

export function resolveModuleSectionByNavItemId(navItemId: string): WorkspaceModuleSection | null {
  for (const section of mockNavMapSectionDefsFromItems()) {
    if (section.items.some((item) => item.id === navItemId)) {
      return section.id as WorkspaceModuleSection
    }
  }
  return null
}

function mockNavMapSectionDefsFromItems() {
  return [
    { id: 'data' as const, items: mockNavDataItems },
    { id: 'uav' as const, items: mockNavUavItems },
    { id: 'ops' as const, items: mockNavOpsItems },
    { id: 'panorama' as const, items: mockNavPanoramaModuleItems },
  ]
}

export interface WorkspaceModuleRoute {
  section: WorkspaceModuleSection
  moduleId: string
}

const MODULE_PATH_RE = /^\/(data|uav|ops|panorama)\/([^/]+)\/?$/

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
