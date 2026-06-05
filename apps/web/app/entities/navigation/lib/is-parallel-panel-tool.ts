import { mockToolMeta } from '../model/mock-nav-items'

/** 并行浮层工具（category=panel）：不与 activeMapTool 互斥，仅手动关闭 */
export function isParallelPanelTool(toolId: string): boolean {
  return mockToolMeta[toolId]?.category === 'panel'
}
