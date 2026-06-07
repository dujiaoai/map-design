import { ConstructionIcon } from 'lucide-react'

import type { MockToolContentProps } from '../../model/types'
import { MockEmptyState } from '../primitives/mock-empty-state'
import { MockToolPanelRoot } from '../primitives/mock-tool-panel-root'

export function FallbackToolContent({ title, pluginToolId }: MockToolContentProps) {
  return (
    <MockToolPanelRoot className="py-1">
      <MockEmptyState
        icon={ConstructionIcon}
        title={`${title}界面建设中`}
        description={`该工具将接入地图插件后提供完整交互；pluginToolId：${pluginToolId}`}
      />
    </MockToolPanelRoot>
  )
}
