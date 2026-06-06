import { ConstructionIcon } from 'lucide-react'

import type { MockModuleContentProps } from '../../model/types'
import { MockEmptyState } from '../primitives/mock-empty-state'

export function FallbackModuleContent({ title }: MockModuleContentProps) {
  return (
    <div className="flex min-h-0 flex-1 flex-col overflow-y-auto p-4 text-sm">
      <MockEmptyState
        icon={ConstructionIcon}
        title={`${title}内容预览中`}
        description="模块 UI 将按 registry 模式逐步补齐；侧栏与 Dock 交互已可用。"
      />
    </div>
  )
}
