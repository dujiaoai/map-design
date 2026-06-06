import { resolveModuleSectionByModuleId } from '~/features/map-workspace/lib/workspace-module-route'

export type ContextTab = 'data' | 'workspace'

const SECTION_MOTION_ORDER: Record<string, number> = {
  data: 0,
  uav: 1,
  ops: 2,
  panorama: 3,
}

export type ModuleSurfaceDirection = 'forward' | 'back'

export function resolveVisibleModuleSurfaceKey(options: {
  tab: ContextTab
  showTabs: boolean
  activeDataModuleId: string | null
  activeDockModuleId: string | null
  activeModuleId: string | null
  dataOpen: boolean
  workspaceOpen: boolean
  workspaceIsUav: boolean
}): string | null {
  if (!options.dataOpen && !options.workspaceOpen) {
    return null
  }

  if (options.showTabs) {
    if (options.tab === 'data' && options.activeDataModuleId) {
      return `data:${options.activeDataModuleId}`
    }
    if (options.tab === 'workspace') {
      return resolveWorkspaceSurfaceKey(
        options.workspaceIsUav,
        options.activeDockModuleId,
        options.activeModuleId,
      )
    }
    return null
  }

  if (options.dataOpen && options.activeDataModuleId) {
    return `data:${options.activeDataModuleId}`
  }

  if (options.workspaceOpen) {
    return resolveWorkspaceSurfaceKey(
      options.workspaceIsUav,
      options.activeDockModuleId,
      options.activeModuleId,
    )
  }

  return null
}

function resolveWorkspaceSurfaceKey(
  workspaceIsUav: boolean,
  activeDockModuleId: string | null,
  activeModuleId: string | null,
): string | null {
  if (workspaceIsUav && activeDockModuleId) {
    return `uav:${activeDockModuleId}`
  }
  if (activeModuleId) {
    const section = resolveModuleSectionByModuleId(activeModuleId)
    return section ? `${section}:${activeModuleId}` : null
  }
  return null
}

export function resolveModuleSurfaceDirection(
  previousKey: string | null,
  nextKey: string | null,
): ModuleSurfaceDirection {
  if (!previousKey || !nextKey || previousKey === nextKey) {
    return 'forward'
  }
  const prevOrder = surfaceMotionOrder(previousKey)
  const nextOrder = surfaceMotionOrder(nextKey)
  return nextOrder >= prevOrder ? 'forward' : 'back'
}

function surfaceMotionOrder(surfaceKey: string): number {
  const section = surfaceKey.split(':')[0]
  return SECTION_MOTION_ORDER[section] ?? 0
}
