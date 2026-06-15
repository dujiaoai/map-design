/** 已注册高保真 mock 的 toolId（批量扩展时在此追加） */
export const REGISTERED_MOCK_TOOL_IDS = [
  'measure-distance',
  'plot-point',
  'swipe-compare',
] as const

/** 已注册高保真 mock 的 moduleId */
export const REGISTERED_MOCK_MODULE_IDS = [
  'thematic',
  'scenic-spots',
  'legend',
  'spatial-analysis',
  'property-view',
  'my-favorites',
  'flight-ledger',
  'view-project',
] as const

/** 已注册高保真 mock 的 drawer toolId */
export const REGISTERED_MOCK_DRAWER_TOOL_IDS = ['global-search'] as const

export type RegisteredMockToolId = (typeof REGISTERED_MOCK_TOOL_IDS)[number]
export type RegisteredMockModuleId = (typeof REGISTERED_MOCK_MODULE_IDS)[number]
export type RegisteredMockDrawerToolId = (typeof REGISTERED_MOCK_DRAWER_TOOL_IDS)[number]

export function isRegisteredMockToolId(toolId: string): toolId is RegisteredMockToolId {
  return (REGISTERED_MOCK_TOOL_IDS as readonly string[]).includes(toolId)
}

export function isRegisteredMockModuleId(moduleId: string): moduleId is RegisteredMockModuleId {
  return (REGISTERED_MOCK_MODULE_IDS as readonly string[]).includes(moduleId)
}

export function isRegisteredMockDrawerToolId(
  toolId: string,
): toolId is RegisteredMockDrawerToolId {
  return (REGISTERED_MOCK_DRAWER_TOOL_IDS as readonly string[]).includes(toolId)
}
