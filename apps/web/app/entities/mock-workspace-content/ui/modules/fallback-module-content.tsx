import { ConstructionIcon } from 'lucide-react'

import { mockModuleMeta } from '~/entities/navigation'
import type { MapPluginCatalogType, MockModuleSegment } from '~/entities/navigation'

import type { MockModuleContentProps } from '../../model/types'
import { MOCK_MODULE_CONTENT_ROOT_CLASS } from '../primitives/mock-module-content-root'
import { MockEmptyState } from '../primitives/mock-empty-state'

const SEGMENT_LABELS: Record<MockModuleSegment, string> = {
  layers: '图层',
  analysis: '分析',
  ops: '运营',
  uav: '机库',
  app: '应用',
}

const PLUGIN_TYPE_LABELS: Record<MapPluginCatalogType, string> = {
  tool: '地图工具',
  display: '展示层',
  'map-chrome': '地图控件',
  'modify-panel': '编辑面板',
  'parallel-panel': '并行面板',
  hybrid: '混合面板',
  'cesium-toolkit': 'Cesium 工具',
}

function MockModuleMetaCard({ moduleId }: { moduleId: string }) {
  const meta = mockModuleMeta[moduleId]
  if (!meta?.pluginToolId && !meta?.pluginType && !meta?.segment) {
    return null
  }

  const rows: Array<{ label: string; value: string }> = []
  if (meta.segment) {
    rows.push({ label: '侧栏段', value: SEGMENT_LABELS[meta.segment] })
  }
  if (meta.pluginType) {
    rows.push({ label: '插件类型', value: PLUGIN_TYPE_LABELS[meta.pluginType] })
  }
  if (meta.pluginToolId) {
    rows.push({ label: 'pluginToolId', value: meta.pluginToolId })
  }

  return (
    <dl className="border-border bg-muted/30 mx-auto mt-4 w-full max-w-sm rounded-lg border px-3 py-2 text-left dark:bg-white/5">
      {rows.map((row) => (
        <div key={row.label} className="grid grid-cols-[5.5rem_1fr] gap-x-2 py-1 text-xs">
          <dt className="text-muted-foreground">{row.label}</dt>
          <dd className="text-foreground font-mono break-all">{row.value}</dd>
        </div>
      ))}
    </dl>
  )
}

export function FallbackModuleContent({ moduleId, title }: MockModuleContentProps) {
  return (
    <div className={MOCK_MODULE_CONTENT_ROOT_CLASS}>
      <MockEmptyState
        icon={ConstructionIcon}
        title={`${title}内容预览中`}
        description="模块 UI 将按 registry 模式逐步补齐；侧栏与 Dock 交互已可用。"
      />
      <MockModuleMetaCard moduleId={moduleId} />
    </div>
  )
}
