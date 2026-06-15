import { beforeEach, describe, expect, it } from 'vitest'

import { useMapWorkspaceStore } from '../model/workspace-store'
import {
  closeSiblingModifyPanelsExcept,
  createModifyPanelsHost,
  isModifyPanelModule,
  listModifyPanelModuleIds,
  resolveModuleIdByPluginToolId,
} from './modify-panels'

describe('modify-panels', () => {
  beforeEach(() => {
    useMapWorkspaceStore.getState().clearAll()
  })

  it('lists modify-panel module ids from mockModuleMeta', () => {
    expect(listModifyPanelModuleIds()).toEqual([
      'spatial-analysis',
      'property-view',
      'my-favorites',
      'view-project',
    ])
    expect(isModifyPanelModule('property-view')).toBe(true)
    expect(isModifyPanelModule('thematic')).toBe(false)
  })

  it('resolves pluginToolId to moduleId', () => {
    expect(resolveModuleIdByPluginToolId('property-view-plugin')).toBe('property-view')
  })

  it('closeSiblingModifyPanelsExcept closes active modify sibling only', () => {
    const store = useMapWorkspaceStore.getState()
    store.toggleMapModule('module-property-view', 'property-view')
    store.toggleMapModule('module-thematic', 'thematic')

    closeSiblingModifyPanelsExcept('spatial-analysis')

    expect(useMapWorkspaceStore.getState().activeModuleId).toBe('thematic')

    store.toggleMapModule('module-spatial-analysis', 'spatial-analysis')
    closeSiblingModifyPanelsExcept('property-view')

    expect(useMapWorkspaceStore.getState().activeModuleId).toBeNull()
  })

  it('createModifyPanelsHost closes by pluginToolId', () => {
    const store = useMapWorkspaceStore.getState()
    store.toggleMapModule('module-spatial-analysis', 'spatial-analysis')

    createModifyPanelsHost().closeSiblingExcept('property-view-plugin')

    expect(useMapWorkspaceStore.getState().activeModuleId).toBeNull()
  })

  it('createModifyPanelsHost keeps panel when except matches active modify module', () => {
    const store = useMapWorkspaceStore.getState()
    store.toggleMapModule('module-property-view', 'property-view')

    createModifyPanelsHost().closeSiblingExcept('property-view-plugin')

    expect(useMapWorkspaceStore.getState().activeModuleId).toBe('property-view')
  })
})
