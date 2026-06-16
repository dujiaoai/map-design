import { Table, type TableProps } from 'antd'
import { cn } from '@repo/ui'

/** 四主列表启用 antd 虚拟滚动时的默认表体高度（px） */
export const ADMIN_LIST_TABLE_BODY_HEIGHT = 520

export type AdminAntTableProps<T extends object> = TableProps<T> & {
  /** 嵌入 AdminPanel 时使用，去掉外层圆角冲突 */
  embedded?: boolean
  /** 固定表体高度并启用 antd 虚拟滚动 */
  bodyHeight?: number
}

export function AdminAntTable<T extends object>({
  className,
  embedded = true,
  size = 'middle',
  pagination,
  bodyHeight,
  scroll,
  virtual,
  ...props
}: AdminAntTableProps<T>) {
  const paginationConfig =
    pagination === false
      ? false
      : {
          showSizeChanger: false,
          showTotal: (total: number, range: [number, number]) =>
            total === 0 ? '无数据' : `第 ${range[0]}–${range[1]} 条，共 ${total} 条`,
          ...pagination,
        }

  const resolvedScroll = bodyHeight != null ? { ...scroll, y: bodyHeight } : scroll
  const resolvedVirtual = bodyHeight != null ? true : virtual

  return (
    <Table<T>
      {...props}
      size={size}
      virtual={resolvedVirtual}
      scroll={resolvedScroll}
      className={cn('admin-ant-table', embedded && 'rounded-none border-0', className)}
      pagination={paginationConfig}
    />
  )
}
