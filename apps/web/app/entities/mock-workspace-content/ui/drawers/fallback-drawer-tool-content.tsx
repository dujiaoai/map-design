import { ConstructionIcon } from 'lucide-react'

import type { MockDrawerToolContentProps } from '../../model/types'
import { MockEmptyState } from '../primitives/mock-empty-state'

export function FallbackDrawerToolContent({ title }: MockDrawerToolContentProps) {
  return (
    <div className="flex min-h-0 flex-1 flex-col overflow-y-auto p-4 text-sm">
      <MockEmptyState
        icon={ConstructionIcon}
        title={`${title}面板建设中`}
        description="右侧条带 UI 已就绪，业务表单将随后续迭代接入。"
      />
    </div>
  )
}
