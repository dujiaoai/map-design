import { Tree, type TreeProps } from 'antd'
import { cn } from '@repo/ui'

export type AdminAntTreeProps = TreeProps

export function AdminAntTree({ className, blockNode = true, ...props }: AdminAntTreeProps) {
  return (
    <Tree
      {...props}
      blockNode={blockNode}
      className={cn('admin-ant-tree', className)}
    />
  )
}
